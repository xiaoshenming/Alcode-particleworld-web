import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光磁热材料(4) —— 光-磁-热三场耦合材料
 * - 固体，密度 Infinity
 * - 深橙灰色调
 */

export const PhotoMagnetoThermalMaterial4: MaterialDef = {
  id: 1225,
  name: '光磁热材料(4)',
  category: '固体',
  description: '光-磁-热三场耦合材料，光照同时产生磁效应和热效应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 162 + Math.floor(Math.random() * 20);
      g = 118 + Math.floor(Math.random() * 20);
      b = 88 + Math.floor(Math.random() * 22);
    } else if (phase < 0.8) {
      r = 172 + Math.floor(Math.random() * 12);
      g = 128 + Math.floor(Math.random() * 12);
      b = 96 + Math.floor(Math.random() * 12);
    } else {
      r = 156 + Math.floor(Math.random() * 10);
      g = 112 + Math.floor(Math.random() * 10);
      b = 82 + Math.floor(Math.random() * 10);
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

registerMaterial(PhotoMagnetoThermalMaterial4);
