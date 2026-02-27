import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态钒铒 —— 钒铒合金的熔融态
 * - 液体，密度 6.5
 * - 冷却至 <2100° → 钒铒合金(1106)
 */

export const MoltenVanadiumErbium: MaterialDef = {
  id: 1107,
  name: '液态钒铒',
  category: '液体',
  description: '钒铒合金的熔融态，高温下具有流动性',
  density: 6.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      r = 225 + Math.floor(Math.random() * 25);
      g = 138 + Math.floor(Math.random() * 28);
      b = 65 + Math.floor(Math.random() * 28);
    } else if (phase < 0.7) {
      r = 238 + Math.floor(Math.random() * 15);
      g = 155 + Math.floor(Math.random() * 18);
      b = 52 + Math.floor(Math.random() * 18);
    } else {
      r = 215 + Math.floor(Math.random() * 18);
      g = 125 + Math.floor(Math.random() * 18);
      b = 48 + Math.floor(Math.random() * 18);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 2100) {
      world.set(x, y, 1106);
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
      if (belowDensity < 6.5 && belowDensity !== Infinity && Math.random() < 0.7) {
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

registerMaterial(MoltenVanadiumErbium);
