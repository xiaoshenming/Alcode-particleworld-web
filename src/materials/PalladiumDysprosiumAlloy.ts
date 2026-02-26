import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钯镝合金 —— 钯与镝的稀土合金
 * - 固体，密度 Infinity
 * - 熔点 >1800° → 液态钯镝(1247)
 */

export const PalladiumDysprosiumAlloy: MaterialDef = {
  id: 1246,
  name: '钯镝合金',
  category: '固体',
  description: '钯与镝的合金，结合钯的催化性与镝的磁性特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 184 + Math.floor(Math.random() * 18);
      g = 188 + Math.floor(Math.random() * 18);
      b = 194 + Math.floor(Math.random() * 18);
    } else if (phase < 0.8) {
      r = 194 + Math.floor(Math.random() * 10);
      g = 198 + Math.floor(Math.random() * 10);
      b = 204 + Math.floor(Math.random() * 10);
    } else {
      r = 179 + Math.floor(Math.random() * 8);
      g = 183 + Math.floor(Math.random() * 8);
      b = 189 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 1800) {
      world.set(x, y, 1247);
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

registerMaterial(PalladiumDysprosiumAlloy);
