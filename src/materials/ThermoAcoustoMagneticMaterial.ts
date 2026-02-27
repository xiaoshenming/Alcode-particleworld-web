import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热声磁材料 —— 热-声-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>500°)产生声效应（生成龙卷风(50)）
 * - 遇龙卷风(50)/声波产生磁效应（生成磁铁(42)）
 * - 深棕红色带热声纹理
 */

export const ThermoAcoustoMagneticMaterial: MaterialDef = {
  id: 660,
  name: '热声磁材料',
  category: '固体',
  description: '热-声-磁三场耦合功能材料，用于热声发动机和磁声成像',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 148 + Math.floor(Math.random() * 15);
      g = 62 + Math.floor(Math.random() * 10);
      b = 55 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 132 + Math.floor(Math.random() * 12);
      g = 50 + Math.floor(Math.random() * 8);
      b = 42 + Math.floor(Math.random() * 8);
    } else {
      r = 165 + Math.floor(Math.random() * 15);
      g = 75 + Math.floor(Math.random() * 12);
      b = 65 + Math.floor(Math.random() * 12);
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

      // 高温产生声效应（模拟热→声）
      if (temp > 500 && nid === 0 && Math.random() < 0.025) {
        world.set(nx, ny, 50);
        world.wakeArea(nx, ny);
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

registerMaterial(ThermoAcoustoMagneticMaterial);
