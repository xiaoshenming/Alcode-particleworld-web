import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态钐 —— 熔融状态的钐
 * - 液体，密度 7.5
 * - 冷却至 <1072° → 凝固为钐(346)
 * - 接触水(2)剧烈冷却产生蒸汽
 * - 明亮橙黄色液态
 */

export const MoltenSamarium: MaterialDef = {
  id: 347,
  name: '液态钐',
  category: '熔融金属',
  description: '熔融状态的钐',
  density: 7.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 235 + Math.floor(Math.random() * 20);
      g = 155 + Math.floor(Math.random() * 25);
      b = 70 + Math.floor(Math.random() * 20);
    } else {
      r = 245 + Math.floor(Math.random() * 10);
      g = 180 + Math.floor(Math.random() * 20);
      b = 85 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 1072) {
      world.set(x, y, 346);
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
      if (world.get(nx, ny) === 2 && Math.random() < 0.8) {
        world.set(nx, ny, 8);
        world.addTemp(x, y, -40);
      }
    }
  },
};

registerMaterial(MoltenSamarium);
