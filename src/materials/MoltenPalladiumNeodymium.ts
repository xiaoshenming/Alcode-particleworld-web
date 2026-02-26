import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钯钕 —— 钯钕合金的熔融态
 * - 液体，密度 12.0
 * - 冷却至 <1750° → 钯钕合金(1236)
 */

export const MoltenPalladiumNeodymium: MaterialDef = {
  id: 1237,
  name: '液态钯钕',
  category: '液体',
  description: '钯钕合金的熔融态，高温下具有流动性',
  density: 12.0,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      r = 240 + Math.floor(Math.random() * 14);
      g = 184 + Math.floor(Math.random() * 18);
      b = 96 + Math.floor(Math.random() * 18);
    } else if (phase < 0.7) {
      r = 240 + Math.floor(Math.random() * 14);
      g = 184 + Math.floor(Math.random() * 18);
      b = 96 + Math.floor(Math.random() * 18);
    } else {
      r = 240 + Math.floor(Math.random() * 14);
      g = 184 + Math.floor(Math.random() * 18);
      b = 96 + Math.floor(Math.random() * 18);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp < 1750) {
      world.set(x, y, 1236);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }
    const below = world.get(x, y + 1);
    if (y + 1 < world.height) {
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 12.0 && belowDensity !== Infinity && Math.random() < 0.7) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
    }
    const dir = Math.random() < 0.5 ? -1 : 1;
    const sx = x + dir;
    if (world.inBounds(sx, y) && world.get(sx, y) === 0) {
      world.swap(x, y, sx, y);
      world.wakeArea(sx, y);
      return;
    }
    const sx2 = x - dir;
    if (world.inBounds(sx2, y) && world.get(sx2, y) === 0) {
      world.swap(x, y, sx2, y);
      world.wakeArea(sx2, y);
      return;
    }
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.12;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(MoltenPalladiumNeodymium);
