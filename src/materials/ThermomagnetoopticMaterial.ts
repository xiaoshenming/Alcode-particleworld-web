import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热磁光材料 —— 热能转化为磁效应和光的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >200° 时产生磁力效果并发光
 * - 过热 >950° 失效变为石头
 * - 暗红褐色带橙色热纹
 */

export const ThermomagnetoopticMaterial: MaterialDef = {
  id: 505,
  name: '热磁光材料',
  category: '特殊',
  description: '热能同时转化为磁效应和光的三效材料，高温时产生磁力和光',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 暗红褐基底
      r = 110 + Math.floor(Math.random() * 15);
      g = 50 + Math.floor(Math.random() * 10);
      b = 42 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 橙色热纹
      r = 200 + Math.floor(Math.random() * 20);
      g = 110 + Math.floor(Math.random() * 20);
      b = 35 + Math.floor(Math.random() * 12);
    } else {
      // 深褐色调
      r = 85 + Math.floor(Math.random() * 10);
      g = 40 + Math.floor(Math.random() * 8);
      b = 35 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 950) {
      world.set(x, y, 3);
      world.wakeArea(x, y);
      return;
    }

    if (temp > 200) {
      // 磁力效果：吸引附近金属粒子
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          // 吸引金属粒子靠近
          if ((nid === 10 || nid === 85 || nid === 86) && Math.random() < 0.02) {
            const mx = dx > 0 ? nx - 1 : dx < 0 ? nx + 1 : nx;
            const my = dy > 0 ? ny - 1 : dy < 0 ? ny + 1 : ny;
            if (world.inBounds(mx, my) && world.get(mx, my) === 0) {
              world.swap(nx, ny, mx, my);
              world.wakeArea(mx, my);
            }
          }
        }
      }

      // 光效果：在空位生成光束
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          if (world.get(nx, ny) === 0 && Math.random() < 0.02) {
            world.set(nx, ny, 48);
            world.wakeArea(nx, ny);
          }
        }
      }
    }

    // 导热
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(ThermomagnetoopticMaterial);
