import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热电声材料(3) —— 热-电-声三场耦合材料
 * - 固体，密度 Infinity
 * - 深赭石色调
 */

export const ThermoElectroAcousticMaterial3: MaterialDef = {
  id: 1140,
  name: '热电声材料(3)',
  category: '固体',
  description: '热-电-声三场耦合材料，热能同时产生电效应和声波响应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 20);
      g = 108 + Math.floor(Math.random() * 20);
      b = 68 + Math.floor(Math.random() * 22);
    } else if (phase < 0.8) {
      r = 165 + Math.floor(Math.random() * 12);
      g = 116 + Math.floor(Math.random() * 12);
      b = 76 + Math.floor(Math.random() * 12);
    } else {
      r = 148 + Math.floor(Math.random() * 10);
      g = 102 + Math.floor(Math.random() * 10);
      b = 62 + Math.floor(Math.random() * 10);
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

registerMaterial(ThermoElectroAcousticMaterial3);
