import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 热声电材料(5) —— 第五代热声电三场耦合材料
 * - 固体，密度 Infinity
 * - 热能-声波-电场三场耦合效应
 * - 灰橙偏暖色调
 */

export const ThermoAcoustoElectricMaterial5: MaterialDef = {
  id: 1065,
  name: '热声电材料(5)',
  category: '固体',
  description: '第五代热声电复合材料，具有增强的热声电耦合效应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 165 + Math.floor(Math.random() * 22);
      g = 148 + Math.floor(Math.random() * 20);
      b = 135 + Math.floor(Math.random() * 18);
    } else if (phase < 0.8) {
      r = 172 + Math.floor(Math.random() * 14);
      g = 155 + Math.floor(Math.random() * 12);
      b = 142 + Math.floor(Math.random() * 12);
    } else {
      r = 160 + Math.floor(Math.random() * 10);
      g = 144 + Math.floor(Math.random() * 10);
      b = 130 + Math.floor(Math.random() * 10);
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
      if (nid === 44 && Math.random() < 0.04) {
        world.addTemp(x, y, 36);
        world.wakeArea(x, y);
      }
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
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

registerMaterial(ThermoAcoustoElectricMaterial5);
