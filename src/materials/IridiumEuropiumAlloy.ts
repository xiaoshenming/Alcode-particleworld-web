import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铱铕合金 —— 铱与铕的高密度稀土合金
 * - 固体，密度 Infinity
 * - 熔点 >2450° → 液态铱铕(1167)
 */

export const IridiumEuropiumAlloy: MaterialDef = {
  id: 1166,
  name: '铱铕合金',
  category: '固体',
  description: '铱与铕的合金，结合铱的高密度与铕的荧光特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 192 + Math.floor(Math.random() * 18);
      g = 190 + Math.floor(Math.random() * 18);
      b = 198 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 202 + Math.floor(Math.random() * 10);
      g = 200 + Math.floor(Math.random() * 10);
      b = 208 + Math.floor(Math.random() * 10);
    } else {
      r = 187 + Math.floor(Math.random() * 8);
      g = 185 + Math.floor(Math.random() * 8);
      b = 193 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 2450) {
      world.set(x, y, 1167);
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

registerMaterial(IridiumEuropiumAlloy);
