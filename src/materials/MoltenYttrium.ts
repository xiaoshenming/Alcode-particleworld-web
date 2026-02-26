import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钇 —— 钇的熔融态
 * - 液体，密度 4.5
 * - 冷却 <1520° → 固态钇(441)
 * - 沸点 >3345° → 蒸汽
 * - 银白色液态金属
 */

export const MoltenYttrium: MaterialDef = {
  id: 442,
  name: '液态钇',
  category: '熔融金属',
  description: '钇的液态形式，银白色高温液态金属',
  density: 4.5,
  color() {
    const r = 200 + Math.floor(Math.random() * 20);
    const g = 205 + Math.floor(Math.random() * 18);
    const b = 215 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 1520) {
      world.set(x, y, 441);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 沸腾蒸发
    if (temp > 3345) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水产生蒸汽
      if (nid === 2 && Math.random() < 0.6) {
        world.set(nx, ny, 8);
        world.addTemp(x, y, -50);
        world.wakeArea(nx, ny);
        continue;
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5) && Math.random() < 0.15) {
        world.set(nx, ny, 6);
        world.wakeArea(nx, ny);
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        const diff = (nt - temp) * 0.1;
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
      if (belowDensity < 4.5 && belowDensity > 0 && Math.random() < 0.5) {
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

registerMaterial(MoltenYttrium);
