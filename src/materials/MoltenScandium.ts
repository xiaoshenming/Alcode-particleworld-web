import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钪 —— 钪的熔融态
 * - 液体，密度 3.0
 * - 冷却 <1520° → 固态钪(451)
 * - 沸点 >2836° → 蒸汽
 * - 银白色液态金属
 */

export const MoltenScandium: MaterialDef = {
  id: 452,
  name: '液态钪',
  category: '熔融金属',
  description: '钪的液态形式，银白色高温液态金属',
  density: 3.0,
  color() {
    const r = 205 + Math.floor(Math.random() * 18);
    const g = 208 + Math.floor(Math.random() * 15);
    const b = 200 + Math.floor(Math.random() * 18);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 1520) {
      world.set(x, y, 451);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    if (temp > 2836) {
      world.set(x, y, 8);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 && Math.random() < 0.6) {
        world.set(nx, ny, 8);
        world.addTemp(x, y, -50);
        world.wakeArea(nx, ny);
        continue;
      }

      if ((nid === 4 || nid === 5) && Math.random() < 0.15) {
        world.set(nx, ny, 6);
        world.wakeArea(nx, ny);
      }

      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        const diff = (nt - temp) * 0.1;
        world.addTemp(x, y, diff);
        world.addTemp(nx, ny, -diff);
      }
    }

    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 3.0 && belowDensity > 0 && Math.random() < 0.5) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.get(x + dir, y + 1) === 0) {
        world.swap(x, y, x + dir, y + 1);
        world.wakeArea(x + dir, y + 1);
        return;
      }
      if (world.inBounds(x - dir, y + 1) && world.get(x - dir, y + 1) === 0) {
        world.swap(x, y, x - dir, y + 1);
        world.wakeArea(x - dir, y + 1);
        return;
      }
      if (world.inBounds(x + dir, y) && world.get(x + dir, y) === 0) {
        world.swap(x, y, x + dir, y);
        world.wakeArea(x + dir, y);
      }
    }
  },
};

registerMaterial(MoltenScandium);
