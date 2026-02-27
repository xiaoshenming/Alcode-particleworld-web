import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁致伸缩材料 —— 在磁场中改变形状的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 靠近磁铁(42)/电磁铁(230)时振动：概率与邻居交换位置
 * - 振动产生热量
 * - 高温(>1200°) → 熔化为液态金属(113)
 * - 深灰色带金属光泽
 */

export const MagnetostrictiveMaterial: MaterialDef = {
  id: 345,
  name: '磁致伸缩材料',
  category: '特殊',
  description: '在磁场中改变形状的智能材料，靠近磁铁时振动',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深灰金属
      r = 95 + Math.floor(Math.random() * 20);
      g = 100 + Math.floor(Math.random() * 20);
      b = 110 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗蓝灰
      r = 80 + Math.floor(Math.random() * 15);
      g = 85 + Math.floor(Math.random() * 15);
      b = 100 + Math.floor(Math.random() * 15);
    } else {
      // 金属高光
      r = 140 + Math.floor(Math.random() * 25);
      g = 145 + Math.floor(Math.random() * 25);
      b = 160 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1200) {
      world.set(x, y, 113);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检测附近是否有磁铁(42)或电磁铁(230)
    let nearMagnet = false;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if (nid === 42 || nid === 230) {
          nearMagnet = true;
          break;
        }
      }
      if (nearMagnet) break;
    }

    if (nearMagnet) {
      // 磁场中振动：概率与随机邻居交换
      if (Math.random() < 0.15) {
        const dirs = DIRS4;
        const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny)) {
          const nid = world.get(nx, ny);
          // 只与空气或同类交换
          if (nid === 0 || nid === 345) {
            world.swap(x, y, nx, ny);
            world.markUpdated(nx, ny);
          }
        }
      }
      // 振动产生热量
      world.addTemp(x, y, 0.3);
    }

    // 导热
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸中等
      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(MagnetostrictiveMaterial);
