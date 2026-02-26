import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铟 —— 熔融状态的铟
 * - 液体，密度 7.31
 * - 冷却至 <157° → 凝固为铟(316)
 * - 接触水(2)快速冷却
 * - 银白色液态金属
 */

export const MoltenIndium: MaterialDef = {
  id: 317,
  name: '液态铟',
  category: '熔融金属',
  description: '熔融状态的铟',
  density: 7.31,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 190 + Math.floor(Math.random() * 25);
      g = 195 + Math.floor(Math.random() * 25);
      b = 210 + Math.floor(Math.random() * 20);
    } else {
      r = 215 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 20);
      b = 235 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 157) {
      world.set(x, y, 316);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 散热
    if (temp > 20) {
      world.addTemp(x, y, -1);
    }

    if (y >= world.height - 1) return;

    // 重力下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 水平流动
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 接触水快速冷却
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 2 && Math.random() < 0.7) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, -30);
      }
    }
  },
};

registerMaterial(MoltenIndium);
