import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态蜡 —— 缓慢流动的可燃液体
 * - 冷却后凝固为固体蜡(25)（温度 < 35°）
 * - 可被火点燃，燃烧时间长
 * - 流动速度比水慢
 */
export const MoltenWax: MaterialDef = {
  id: 26,
  name: '液蜡',
  color() {
    const r = 250 + Math.floor(Math.random() * 5);
    const g = 190 + Math.floor(Math.random() * 30);
    const b = 80 + Math.floor(Math.random() * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 橙黄色
  },
  density: 1.5, // 比水轻，浮在水面
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固为固体蜡
    if (temp < 35) {
      world.set(x, y, 25); // 固体蜡
      return;
    }

    // 检查邻居：被火点燃
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 6 && Math.random() < 0.08) {
        world.set(x, y, 6); // 着火
        return;
      }
    }

    // 液蜡自身缓慢散热
    if (temp > 40) {
      world.addTemp(x, y, -0.5);
    }

    if (y >= world.height - 1) return;

    // 缓慢下落（比水慢）
    if (Math.random() < 0.5) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 斜下
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }

    // 缓慢水平流动
    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(MoltenWax);
