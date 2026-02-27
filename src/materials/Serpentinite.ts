import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛇纹岩 —— 变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 绿色带蛇纹状纹理
 * - 中等硬度：酸可缓慢腐蚀
 * - 高温(>1000°)分解为熔岩
 * - 含水：加热到100°以上释放蒸汽
 */

export const Serpentinite: MaterialDef = {
  id: 269,
  name: '蛇纹岩',
  category: '矿石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深绿
      r = 40 + Math.floor(Math.random() * 20);
      g = 80 + Math.floor(Math.random() * 30);
      b = 45 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 黄绿纹理
      r = 70 + Math.floor(Math.random() * 25);
      g = 95 + Math.floor(Math.random() * 25);
      b = 40 + Math.floor(Math.random() * 15);
    } else if (phase < 0.9) {
      // 暗绿
      r = 30 + Math.floor(Math.random() * 15);
      g = 60 + Math.floor(Math.random() * 20);
      b = 35 + Math.floor(Math.random() * 15);
    } else {
      // 白色脉纹
      const base = 160 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 5;
      b = base - 5;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解为熔岩
    if (temp > 1000) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 加热释放蒸汽（含水矿物）
    if (temp > 100 && Math.random() < 0.01) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
          world.set(nx, ny, 8); // 蒸汽
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          break;
        }
      }
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸腐蚀
      if (nid === 9 && Math.random() < 0.015) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸腐蚀更快
      if ((nid === 173 || nid === 183) && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 低导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Serpentinite);
