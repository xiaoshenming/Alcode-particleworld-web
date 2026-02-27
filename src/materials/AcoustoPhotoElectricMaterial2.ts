import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

export const AcoustoPhotoElectricMaterial2: MaterialDef = {
  id: 955,
  name: '声光电材料(2)',
  category: '固体',
  description: '第二代声光电复合材料，具有增强的声光电耦合效应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 162 + Math.floor(Math.random() * 25);
      g = 175 + Math.floor(Math.random() * 20);
      b = 148 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      r = 170 + Math.floor(Math.random() * 15);
      g = 183 + Math.floor(Math.random() * 16);
      b = 156 + Math.floor(Math.random() * 17);
    } else {
      r = 162 + Math.floor(Math.random() * 10);
      g = 175 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 10);
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
        world.addTemp(x, y, 40);
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
registerMaterial(AcoustoPhotoElectricMaterial2);
