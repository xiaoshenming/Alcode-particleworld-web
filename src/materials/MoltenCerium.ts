import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铈 —— 熔融状态的铈
 * - 液体，密度 6.7
 * - 冷却至 <795° → 凝固为铈(356)
 * - 接触水(2)剧烈反应产生蒸汽
 * - 极易氧化：接触空气缓慢产生烟(7)
 * - 明亮橙红色液态
 */

export const MoltenCerium: MaterialDef = {
  id: 357,
  name: '液态铈',
  category: '熔融金属',
  description: '熔融状态的铈',
  density: 6.7,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 245 + Math.floor(Math.random() * 10);
      g = 140 + Math.floor(Math.random() * 25);
      b = 55 + Math.floor(Math.random() * 20);
    } else {
      r = 250 + Math.floor(Math.random() * 5);
      g = 165 + Math.floor(Math.random() * 20);
      b = 70 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 795) {
      world.set(x, y, 356);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    if (temp > 20) {
      world.addTemp(x, y, -1.5);
    }

    if (y >= world.height - 1) return;

    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 && Math.random() < 0.8) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, -40);
      }

      // 氧化产烟
      if (nid === 0 && Math.random() < 0.01) {
        world.set(nx, ny, 7);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(MoltenCerium);
