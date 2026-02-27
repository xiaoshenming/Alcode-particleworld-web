import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铱钕合金 —— 铱与钕的高密度稀土合金
 * - 固体，密度 Infinity
 * - 熔点 >2450° → 液态铱钕(1137)
 */

export const IridiumNeodymiumAlloy: MaterialDef = {
  id: 1136,
  name: '铱钕合金',
  category: '固体',
  description: '铱与钕的合金，结合铱的高密度与钕的磁性特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 188 + Math.floor(Math.random() * 18);
      g = 192 + Math.floor(Math.random() * 18);
      b = 208 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 198 + Math.floor(Math.random() * 10);
      g = 202 + Math.floor(Math.random() * 10);
      b = 218 + Math.floor(Math.random() * 10);
    } else {
      r = 183 + Math.floor(Math.random() * 8);
      g = 187 + Math.floor(Math.random() * 8);
      b = 203 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 2450) {
      world.set(x, y, 1137);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }
    const dirs = DIRS4;
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

registerMaterial(IridiumNeodymiumAlloy);
