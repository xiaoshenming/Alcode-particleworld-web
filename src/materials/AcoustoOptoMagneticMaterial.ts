import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 声光磁材料 —— 声-光-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇龙卷风(50)/声波产生光效应（生成荧光粉(133)）
 * - 遇光束(48)/激光(47)产生磁效应（生成磁铁(42)）
 * - 深靛蓝色带声光纹理
 */

export const AcoustoOptoMagneticMaterial: MaterialDef = {
  id: 655,
  name: '声光磁材料',
  category: '固体',
  description: '声-光-磁三场耦合功能材料，用于声光调制和磁光存储',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 58 + Math.floor(Math.random() * 12);
      g = 52 + Math.floor(Math.random() * 10);
      b = 142 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 45 + Math.floor(Math.random() * 10);
      g = 40 + Math.floor(Math.random() * 8);
      b = 128 + Math.floor(Math.random() * 12);
    } else {
      r = 72 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 12);
      b = 158 + Math.floor(Math.random() * 12);
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

      // 遇声波产生光效应（模拟声→光）
      if (nid === 50 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 133);
          world.wakeArea(x, fy);
        }
      }

      // 遇光束/激光产生磁效应（模拟光→磁）
      if ((nid === 48 || nid === 47) && Math.random() < 0.04) {
        if (world.get(nx, ny) === nid) {
          world.set(nx, ny, 42);
          world.wakeArea(nx, ny);
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

registerMaterial(AcoustoOptoMagneticMaterial);
