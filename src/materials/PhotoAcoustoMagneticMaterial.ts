import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光声磁材料 —— 光-声-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇光束(48)/激光(47)产生声效应（生成龙卷风(50)）
 * - 遇龙卷风(50)产生磁效应（生成磁铁(42)）
 * - 深翠绿色带光声纹理
 */

export const PhotoAcoustoMagneticMaterial: MaterialDef = {
  id: 670,
  name: '光声磁材料',
  category: '固体',
  description: '光-声-磁三场耦合功能材料，用于光声成像和磁声检测',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 32 + Math.floor(Math.random() * 12);
      g = 118 + Math.floor(Math.random() * 15);
      b = 82 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 22 + Math.floor(Math.random() * 10);
      g = 105 + Math.floor(Math.random() * 12);
      b = 70 + Math.floor(Math.random() * 8);
    } else {
      r = 45 + Math.floor(Math.random() * 15);
      g = 135 + Math.floor(Math.random() * 12);
      b = 95 + Math.floor(Math.random() * 12);
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

      // 遇光产生声效应（模拟光→声）
      if ((nid === 48 || nid === 47) && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 50);
          world.wakeArea(x, fy);
        }
      }

      // 遇声波产生磁效应（模拟声→磁）
      if (nid === 50 && Math.random() < 0.04) {
        world.set(nx, ny, 42);
        world.wakeArea(nx, ny);
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

registerMaterial(PhotoAcoustoMagneticMaterial);
