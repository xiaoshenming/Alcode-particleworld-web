import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铌铼 —— 铌铼合金的熔融态
 * - 液体，密度 12.5
 * - 冷却 <2670° → 固态铌铼合金(481)
 * - 沸点 >5200° → 蒸汽
 * - 暖银白色液态金属
 */

export const MoltenNiobiumRhenium: MaterialDef = {
  id: 482,
  name: '液态铌铼',
  category: '熔融金属',
  description: '铌铼合金的液态形式，暖银白色高温液态金属',
  density: 12.5,
  color() {
    const r = 185 + Math.floor(Math.random() * 18);
    const g = 180 + Math.floor(Math.random() * 15);
    const b = 175 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 2670) {
      world.set(x, y, 481);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    if (temp > 5200) {
      world.set(x, y, 8);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 && Math.random() < 0.7) {
        world.set(nx, ny, 8);
        world.addTemp(x, y, -75);
        world.wakeArea(nx, ny);
        continue;
      }

      if ((nid === 4 || nid === 5) && Math.random() < 0.2) {
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
      if (belowDensity < 12.5 && belowDensity > 0 && Math.random() < 0.5) {
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

registerMaterial(MoltenNiobiumRhenium);
