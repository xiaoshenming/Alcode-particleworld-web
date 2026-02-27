import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态铑铕 —— 铑铕合金的熔融态
 * - 液体，密度 12.4
 * - 冷却至 <1950° → 铑铕合金(1216)
 */

export const MoltenRhodiumEuropium: MaterialDef = {
  id: 1217,
  name: '液态铑铕',
  category: '液体',
  description: '铑铕合金的熔融态，高温下具有流动性',
  density: 12.4,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      r = 242 + Math.floor(Math.random() * 12);
      g = 174 + Math.floor(Math.random() * 20);
      b = 84 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      r = 242 + Math.floor(Math.random() * 12);
      g = 174 + Math.floor(Math.random() * 20);
      b = 84 + Math.floor(Math.random() * 20);
    } else {
      r = 242 + Math.floor(Math.random() * 12);
      g = 174 + Math.floor(Math.random() * 20);
      b = 84 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp < 1950) {
      world.set(x, y, 1216);
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
      if (belowDensity < 12.4 && belowDensity !== Infinity && Math.random() < 0.7) {
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
    const dirs = DIRS4;
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

registerMaterial(MoltenRhodiumEuropium);
