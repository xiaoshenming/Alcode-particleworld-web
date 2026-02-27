import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光声磁材料(2) —— 光-声-磁三场耦合功能材料变种
 * - 固体，密度 Infinity（不可移动）
 * - 遇光束(48)产生声效应（生成龙卷风(50)碎片）
 * - 遇龙卷风(50)产生磁效应（吸引附近金属粒子）
 * - 深灰紫蓝色带光声纹理
 */

export const PhotoAcoustoMagneticMaterial2: MaterialDef = {
  id: 770,
  name: '光声磁材料(2)',
  category: '固体',
  description: '光-声-磁三场耦合功能材料变种，用于高灵敏度光声磁传感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 98 + Math.floor(Math.random() * 25);
      g = 82 + Math.floor(Math.random() * 24);
      b = 125 + Math.floor(Math.random() * 24);
    } else if (phase < 0.8) {
      r = 108 + Math.floor(Math.random() * 14);
      g = 92 + Math.floor(Math.random() * 13);
      b = 135 + Math.floor(Math.random() * 13);
    } else {
      r = 92 + Math.floor(Math.random() * 12);
      g = 78 + Math.floor(Math.random() * 10);
      b = 118 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇光束产生声效应（模拟光→声）
      if (nid === 48 && Math.random() < 0.03) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 50);
          world.wakeArea(x, fy);
        }
      }

      // 遇龙卷风产生磁效应（吸引附近金属粒子）
      if (nid === 50 && Math.random() < 0.04) {
        for (let rx = -3; rx <= 3; rx++) {
          for (let ry = -3; ry <= 3; ry++) {
            const mx = x + rx, my = y + ry;
            if (!world.inBounds(mx, my)) continue;
            const mid = world.get(mx, my);
            // 金属类材质：金属(10)、铜(85)、锡(86)、磁铁(42)
            if ((mid === 10 || mid === 85 || mid === 86 || mid === 42) && Math.random() < 0.08) {
              const toX = mx + (mx > x ? -1 : mx < x ? 1 : 0);
              const toY = my + (my > y ? -1 : my < y ? 1 : 0);
              if (world.inBounds(toX, toY) && world.get(toX, toY) === 0) {
                world.swap(mx, my, toX, toY);
                world.wakeArea(toX, toY);
              }
            }
          }
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

registerMaterial(PhotoAcoustoMagneticMaterial2);
