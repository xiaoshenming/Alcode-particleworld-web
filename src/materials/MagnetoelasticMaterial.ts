import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磁弹性材料 —— 在磁场/应力下改变磁性的智能材料
 * - 轻质固体，密度 1.8（受重力下落）
 * - 接触磁铁(42)时向周围传递磁力（吸引金属粒子）
 * - 接触电弧(145)时产生振动效果（随机交换邻居）
 * - 接触火(6)时缓慢燃烧
 * - 深灰色带紫色金属光泽
 */

export const MagnetoelasticMaterial: MaterialDef = {
  id: 415,
  name: '磁弹性材料',
  category: '特殊',
  description: '应力改变磁性的智能材料，接触磁铁时产生磁力传递效果',
  density: 1.8,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深灰紫
      r = 95 + Math.floor(Math.random() * 18);
      g = 80 + Math.floor(Math.random() * 15);
      b = 115 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗紫灰
      r = 75 + Math.floor(Math.random() * 12);
      g = 65 + Math.floor(Math.random() * 10);
      b = 100 + Math.floor(Math.random() * 15);
    } else {
      // 亮紫金属光泽
      r = 125 + Math.floor(Math.random() * 18);
      g = 105 + Math.floor(Math.random() * 15);
      b = 155 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const dirs = DIRS4;
    let nearMagnet = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火缓慢燃烧
      if (nid === 6 && Math.random() < 0.03) {
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }

      // 检测磁铁
      if (nid === 42) {
        nearMagnet = true;
      }

      // 接触电弧产生振动（随机交换邻居）
      if (nid === 145 && Math.random() < 0.15) {
        const rdx = Math.random() < 0.5 ? -1 : 1;
        const rdy = Math.random() < 0.5 ? -1 : 1;
        const sx = x + rdx, sy = y + rdy;
        if (world.inBounds(sx, sy) && world.get(sx, sy) !== 0) {
          world.swap(x, y, sx, sy);
          world.wakeArea(x, y);
          world.wakeArea(sx, sy);
          return;
        }
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 磁铁附近：吸引周围金属粒子靠近
    if (nearMagnet && Math.random() < 0.2) {
      for (let r = 2; r <= 4; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
            const mx = x + dx, my = y + dy;
            if (!world.inBounds(mx, my)) continue;
            const mid = world.get(mx, my);
            // 吸引金属类粒子
            if (mid === 10 || mid === 85 || mid === 86) {
              // 尝试将金属粒子向自己方向移动一格
              const stepX = dx > 0 ? -1 : dx < 0 ? 1 : 0;
              const stepY = dy > 0 ? -1 : dy < 0 ? 1 : 0;
              const tx = mx + stepX, ty = my + stepY;
              if (world.inBounds(tx, ty) && world.isEmpty(tx, ty)) {
                world.swap(mx, my, tx, ty);
                world.wakeArea(tx, ty);
              }
              break;
            }
          }
        }
        break; // 只搜一圈
      }
    }

    // === 轻固体运动（受重力下落） ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 1.8) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下滑落
    if (y < world.height - 1 && Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(MagnetoelasticMaterial);
