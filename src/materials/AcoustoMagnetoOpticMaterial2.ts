import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声磁光材料(2) —— 声-磁-光三场耦合功能材料变种
 * - 固体，密度 Infinity（不可移动）
 * - 遇龙卷风(50)产生磁效应（吸引附近金属粒子）
 * - 遇磁铁(42)产生光效应（生成荧光粉(133)在空位）
 * - 深灰青色带声磁纹理
 */

export const AcoustoMagnetoOpticMaterial2: MaterialDef = {
  id: 765,
  name: '声磁光材料(2)',
  category: '固体',
  description: '声-磁-光三场耦合功能材料变种，用于声光调制和磁光传感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 72 + Math.floor(Math.random() * 12);
      g = 108 + Math.floor(Math.random() * 12);
      b = 115 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 85 + Math.floor(Math.random() * 11);
      g = 122 + Math.floor(Math.random() * 11);
      b = 128 + Math.floor(Math.random() * 11);
    } else {
      r = 65 + Math.floor(Math.random() * 8);
      g = 100 + Math.floor(Math.random() * 8);
      b = 108 + Math.floor(Math.random() * 8);
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

      // 遇龙卷风产生磁效应（吸引附近金属粒子）
      if (nid === 50 && Math.random() < 0.03) {
        for (let mx = x - 3; mx <= x + 3; mx++) {
          for (let my = y - 3; my <= y + 3; my++) {
            if (!world.inBounds(mx, my)) continue;
            const mid = world.get(mx, my);
            if (mid === 10 || mid === 85 || mid === 86) {
              const ddx = x - mx, ddy = y - my;
              const tx = mx + Math.sign(ddx), ty = my + Math.sign(ddy);
              if (world.inBounds(tx, ty) && world.get(tx, ty) === 0) {
                world.swap(mx, my, tx, ty);
                world.wakeArea(tx, ty);
              }
            }
          }
        }
      }

      // 遇磁铁产生光效应（生成荧光粉(133)在空位）
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 133);
          world.wakeArea(x, fy);
        }
      }

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

registerMaterial(AcoustoMagnetoOpticMaterial2);
