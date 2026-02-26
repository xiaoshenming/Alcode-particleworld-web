import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电热声材料(5) —— 电-热-声三场耦合材料
 * - 固体，密度 Infinity
 * - 深青铜色调
 */

export const ElectroThermoAcousticMaterial5: MaterialDef = {
  id: 1240,
  name: '电热声材料(5)',
  category: '固体',
  description: '电-热-声三场耦合材料，电场同时产生热效应和声波',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 146 + Math.floor(Math.random() * 20);
      g = 118 + Math.floor(Math.random() * 20);
      b = 92 + Math.floor(Math.random() * 22);
    } else if (phase < 0.8) {
      r = 156 + Math.floor(Math.random() * 12);
      g = 128 + Math.floor(Math.random() * 12);
      b = 100 + Math.floor(Math.random() * 12);
    } else {
      r = 140 + Math.floor(Math.random() * 10);
      g = 112 + Math.floor(Math.random() * 10);
      b = 86 + Math.floor(Math.random() * 10);
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

registerMaterial(ElectroThermoAcousticMaterial5);
