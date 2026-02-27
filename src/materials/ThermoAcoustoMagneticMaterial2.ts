import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热声磁材料(2) —— 热-声-磁三场耦合功能材料变种
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)产生电效应（生成火花(28)在空位）
 * - 遇电线(44)升温
 * - 暖紫色带磁热纹理
 */

export const ThermoAcoustoMagneticMaterial2: MaterialDef = {
  id: 795,
  name: '热声磁材料(2)',
  category: '固体',
  description: '第二代热声磁复合材料，具有增强的热声磁耦合效应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 150 + Math.floor(Math.random() * 25);
      g = 135 + Math.floor(Math.random() * 20);
      b = 155 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      r = 158 + Math.floor(Math.random() * 15);
      g = 142 + Math.floor(Math.random() * 16);
      b = 163 + Math.floor(Math.random() * 17);
    } else {
      r = 150 + Math.floor(Math.random() * 10);
      g = 135 + Math.floor(Math.random() * 10);
      b = 155 + Math.floor(Math.random() * 10);
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

      // 遇磁铁产生电效应（生成火花在空位）
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
          world.wakeArea(x, fy);
        }
      }

      // 遇电线升温
      if (nid === 44 && Math.random() < 0.04) {
        world.addTemp(x, y, 40);
        world.wakeArea(x, y);
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

registerMaterial(ThermoAcoustoMagneticMaterial2);
