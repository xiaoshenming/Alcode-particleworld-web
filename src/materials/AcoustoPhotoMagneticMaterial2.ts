import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 声光磁材料(2) —— 声-光-磁三场耦合材料
 * - 固体，密度 Infinity
 * - 声波可产生光学和磁场响应
 * - 深青蓝色调
 */

export const AcoustoPhotoMagneticMaterial2: MaterialDef = {
  id: 1110,
  name: '声光磁材料(2)',
  category: '固体',
  description: '声-光-磁三场耦合材料，声波同时产生光学和磁场响应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 48 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 20);
      b = 145 + Math.floor(Math.random() * 22);
    } else if (phase < 0.8) {
      r = 55 + Math.floor(Math.random() * 12);
      g = 102 + Math.floor(Math.random() * 12);
      b = 155 + Math.floor(Math.random() * 12);
    } else {
      r = 42 + Math.floor(Math.random() * 10);
      g = 88 + Math.floor(Math.random() * 10);
      b = 138 + Math.floor(Math.random() * 10);
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
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
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

registerMaterial(AcoustoPhotoMagneticMaterial2);
