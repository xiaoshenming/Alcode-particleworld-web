import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铌钛 —— 铌钛合金的熔融态
 * - 液体，密度 8.2
 * - 冷却 <2320° → 固态铌钛合金(496)
 * - 沸点 >4400° → 蒸汽
 * - 浅银灰色液态金属
 */

export const MoltenNiobiumTitanium: MaterialDef = {
  id: 497,
  name: '液态铌钛',
  category: '熔融金属',
  description: '铌钛合金的液态形式，浅银灰色高温液态金属',
  density: 8.2,
  color() {
    const r = 188 + Math.floor(Math.random() * 18);
    const g = 190 + Math.floor(Math.random() * 15);
    const b = 195 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 2320) {
      world.set(x, y, 496);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    if (temp > 4400) {
      world.set(x, y, 8);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 && Math.random() < 0.7) {
        world.set(nx, ny, 8);
        world.addTemp(x, y, -60);
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
      if (belowDensity < 8.2 && belowDensity > 0 && Math.random() < 0.5) {
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

registerMaterial(MoltenNiobiumTitanium);
