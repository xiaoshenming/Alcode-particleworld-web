import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铱镝合金 —— 铱与镝的高密度稀土合金
 * - 固体，密度 Infinity
 * - 熔点 >2450° → 液态铱镝(1147)
 */

export const IridiumDysprosiumAlloy: MaterialDef = {
  id: 1146,
  name: '铱镝合金',
  category: '固体',
  description: '铱与镝的合金，结合铱的高密度与镝的磁性特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 186 + Math.floor(Math.random() * 18);
      g = 191 + Math.floor(Math.random() * 18);
      b = 206 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 196 + Math.floor(Math.random() * 10);
      g = 201 + Math.floor(Math.random() * 10);
      b = 216 + Math.floor(Math.random() * 10);
    } else {
      r = 181 + Math.floor(Math.random() * 8);
      g = 186 + Math.floor(Math.random() * 8);
      b = 201 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 2450) {
      world.set(x, y, 1147);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.09;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(IridiumDysprosiumAlloy);
