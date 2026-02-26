import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钯钆合金 —— 钯与钆的合金
 * - 固体，密度 Infinity
 * - 熔点 >1800° → 液态钯钆(1242)
 */

export const PalladiumGadoliniumAlloy: MaterialDef = {
  id: 1241,
  name: '钯钆合金',
  category: '固体',
  description: '钯与钆的合金，结合钯的催化性与钆的磁性特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 190 + Math.floor(Math.random() * 18);
      g = 186 + Math.floor(Math.random() * 18);
      b = 180 + Math.floor(Math.random() * 18);
    } else if (phase < 0.8) {
      r = 200 + Math.floor(Math.random() * 10);
      g = 196 + Math.floor(Math.random() * 10);
      b = 190 + Math.floor(Math.random() * 10);
    } else {
      r = 185 + Math.floor(Math.random() * 8);
      g = 181 + Math.floor(Math.random() * 8);
      b = 175 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 1800) {
      world.set(x, y, 1242);
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

registerMaterial(PalladiumGadoliniumAlloy);
