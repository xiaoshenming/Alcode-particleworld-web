import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 熔岩 —— 高温液体，缓慢流动
 * - 接触水 → 水变蒸汽，熔岩变黑曜石
 * - 点燃可燃物（木头、油）
 * - 缓慢冷却（小概率自然变成石头）
 */

/** 可燃材质 ID */
const FLAMMABLE = new Set([4, 5, 13, 25, 26]); // 木头、油、植物、蜡、液蜡

export const Lava: MaterialDef = {
  id: 11,
  name: '熔岩',
  color() {
    const t = Math.random();
    const r = 200 + Math.floor(t * 55);
    const g = 50 + Math.floor(t * 80);
    const b = 0;
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 橙红色
  },
  density: 4, // 很重的液体
  update(x: number, y: number, world: WorldAPI) {
    // 熔岩产生高温
    world.setTemp(x, y, 500);

    // 刷新颜色（熔岩闪烁）
    world.set(x, y, 11);

    // 检查邻居进行反应
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];

    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 熔岩 + 水 → 黑曜石 + 蒸汽
      if (nid === 2) {
        world.set(x, y, 60);  // 熔岩急冷为黑曜石
        world.set(nx, ny, 8); // 水变蒸汽
        return;
      }

      // 点燃可燃物
      if (FLAMMABLE.has(nid) && Math.random() < 0.1) {
        world.set(nx, ny, 6); // 着火
        world.markUpdated(nx, ny);
      }
    }

    // 极小概率自然冷却
    if (Math.random() < 0.001) {
      world.set(x, y, 3); // 变石头
      return;
    }

    if (y >= world.height - 1) return;

    // 缓慢下落（比水慢）
    if (Math.random() < 0.6) {
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
    }

    // 缓慢水平流动
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 密度置换：熔岩很重，沉入轻液体
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < Lava.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Lava);
