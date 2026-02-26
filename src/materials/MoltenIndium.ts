import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铟 —— 铟的熔融态
 * - 液体，密度 5.5（较重液体）
 * - 冷却 <155° → 固态铟(431)
 * - 沸点 >2072° → 蒸汽
 * - 银白色液态金属
 */

export const MoltenIndium: MaterialDef = {
  id: 432,
  name: '液态铟',
  category: '熔融金属',
  description: '铟的液态形式，银白色液态金属，可润湿玻璃',
  density: 5.5,
  color() {
    const r = 200 + Math.floor(Math.random() * 20);
    const g = 205 + Math.floor(Math.random() * 18);
    const b = 225 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 155) {
      world.set(x, y, 431);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    if (temp > 2072) {
      world.set(x, y, 8);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if ((nid === 4 || nid === 5) && temp > 300 && Math.random() < 0.15) {
        world.set(nx, ny, 6);
        world.wakeArea(nx, ny);
      }

      if (nid === 2 && temp > 100 && Math.random() < 0.3) {
        world.set(nx, ny, 8);
        world.addTemp(x, y, -40);
        world.wakeArea(nx, ny);
      }

      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        const diff = (nt - temp) * 0.12;
        world.addTemp(x, y, diff);
        world.addTemp(nx, ny, -diff);
      }
    }

    // 重力下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 5.5 && belowDensity > 0 && Math.random() < 0.4) {
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

registerMaterial(MoltenIndium);
