import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 点燃液蜡的热源 */
const MOLTEN_WAX_IGNITORS = new Set([6, 11, 28]); // 火、熔岩、火花

/**
 * 液态蜡 —— 缓慢流动的可燃液体
 * - 冷却后凝固为固体蜡(25)（温度 < 35°）
 * - 接触火/熔岩/火花点燃，燃烧时间长
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

    // 检查邻居：被火/熔岩/火花点燃（显式4方向，无HOF）
    if (world.inBounds(x, y - 1) && MOLTEN_WAX_IGNITORS.has(world.get(x, y - 1)) && Math.random() < 0.08) {
      world.set(x, y, 6); return;
    }
    if (world.inBounds(x, y + 1) && MOLTEN_WAX_IGNITORS.has(world.get(x, y + 1)) && Math.random() < 0.08) {
      world.set(x, y, 6); return;
    }
    if (world.inBounds(x - 1, y) && MOLTEN_WAX_IGNITORS.has(world.get(x - 1, y)) && Math.random() < 0.08) {
      world.set(x, y, 6); return;
    }
    if (world.inBounds(x + 1, y) && MOLTEN_WAX_IGNITORS.has(world.get(x + 1, y)) && Math.random() < 0.08) {
      world.set(x, y, 6); return;
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
