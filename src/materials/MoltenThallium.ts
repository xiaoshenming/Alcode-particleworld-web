import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铊 —— 铊的熔融态
 * - 液体，密度 8（重液态金属）
 * - 冷却 <280° → 凝固为铊(306)
 * - 剧毒：接触水(2) → 毒液(19)
 * - 银灰色带暗红光泽
 */

export const MoltenThallium: MaterialDef = {
  id: 307,
  name: '液态铊',
  category: '熔融金属',
  description: '铊的熔融态，剧毒液态金属',
  density: 8,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 200 + Math.floor(Math.random() * 30);
      g = 160 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 220 + Math.floor(Math.random() * 25);
      g = 180 + Math.floor(Math.random() * 20);
      b = 150 + Math.floor(Math.random() * 20);
    } else {
      r = 180 + Math.floor(Math.random() * 20);
      g = 140 + Math.floor(Math.random() * 15);
      b = 130 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 280) {
      world.set(x, y, 306);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    world.addTemp(x, y, -1);

    // 重力下落
    if (y < world.height - 1) {
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
    }

    // 邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 剧毒污染水
      if (nid === 2 && Math.random() < 0.12) {
        world.set(nx, ny, 19);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 加热邻居
      if (nid !== 0 && Math.random() < 0.08) {
        world.addTemp(nx, ny, 10);
      }
    }

    // 水平流动
    if (Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(MoltenThallium);
