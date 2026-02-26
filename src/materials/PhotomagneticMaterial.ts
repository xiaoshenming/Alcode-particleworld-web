import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光磁材料 —— 光照下改变磁性的智能材料
 * - 轻质固体，密度 1.6（受重力下落）
 * - 接触火(6)/熔岩(11)时被"光激发"，向周围发射光子（随机将空位变为火花）
 * - 接触磁铁(42)时产生排斥效果（推开周围粒子）
 * - 接触水缓慢降解
 * - 深蓝色带银色光泽
 */

export const PhotomagneticMaterial: MaterialDef = {
  id: 425,
  name: '光磁材料',
  category: '特殊',
  description: '光照下改变磁性的智能材料，接触高温光源时发射光子',
  density: 1.6,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深蓝银
      r = 70 + Math.floor(Math.random() * 18);
      g = 85 + Math.floor(Math.random() * 15);
      b = 145 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗蓝
      r = 50 + Math.floor(Math.random() * 12);
      g = 65 + Math.floor(Math.random() * 10);
      b = 120 + Math.floor(Math.random() * 15);
    } else {
      // 亮银蓝光泽
      r = 110 + Math.floor(Math.random() * 18);
      g = 130 + Math.floor(Math.random() * 15);
      b = 185 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火/熔岩时被光激发，发射火花
      if ((nid === 6 || nid === 11) && Math.random() < 0.1) {
        for (const [dx2, dy2] of dirs) {
          const ex = x + dx2, ey = y + dy2;
          if (world.inBounds(ex, ey) && world.isEmpty(ex, ey) && Math.random() < 0.5) {
            world.set(ex, ey, 6); // 火花
            world.wakeArea(ex, ey);
            break;
          }
        }
        return;
      }

      // 接触磁铁时排斥周围粒子
      if (nid === 42 && Math.random() < 0.15) {
        for (const [dx2, dy2] of dirs) {
          const px = x + dx2, py = y + dy2;
          if (!world.inBounds(px, py) || world.isEmpty(px, py)) continue;
          const pid = world.get(px, py);
          if (pid === 42 || pid === 425) continue; // 不推自己和磁铁
          // 推开一格
          const fx = px + dx2, fy = py + dy2;
          if (world.inBounds(fx, fy) && world.isEmpty(fx, fy)) {
            world.swap(px, py, fx, fy);
            world.wakeArea(fx, fy);
          }
        }
        return;
      }

      // 接触水缓慢降解
      if (nid === 2 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 高温分解
    if (temp > 350) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    // === 轻固体运动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 1.6) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

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

registerMaterial(PhotomagneticMaterial);
