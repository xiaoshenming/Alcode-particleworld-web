import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光磁声材料(5) —— 光-磁-声三场耦合材料
 * - 固体，密度 Infinity
 * - 深紫灰色调
 */

export const PhotoMagnetoAcousticMaterial5: MaterialDef = {
  id: 1195,
  name: '光磁声材料(5)',
  category: '固体',
  description: '光-磁-声三场耦合材料，光照同时产生磁效应和声波',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 132 + Math.floor(Math.random() * 20);
      g = 115 + Math.floor(Math.random() * 20);
      b = 148 + Math.floor(Math.random() * 22);
    } else if (phase < 0.8) {
      r = 142 + Math.floor(Math.random() * 12);
      g = 125 + Math.floor(Math.random() * 12);
      b = 156 + Math.floor(Math.random() * 12);
    } else {
      r = 126 + Math.floor(Math.random() * 10);
      g = 109 + Math.floor(Math.random() * 10);
      b = 142 + Math.floor(Math.random() * 10);
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

registerMaterial(PhotoMagnetoAcousticMaterial5);
