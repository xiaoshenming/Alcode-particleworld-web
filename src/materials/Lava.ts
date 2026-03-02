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

    // 检查邻居进行反应（显式4方向，无HOF）
    // 熔岩 + 水 → 黑曜石 + 蒸汽（立即return）
    if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 2) { world.set(x, y, 60); world.set(x, y - 1, 8); return; }
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 2) { world.set(x, y, 60); world.set(x, y + 1, 8); return; }
    if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 2) { world.set(x, y, 60); world.set(x - 1, y, 8); return; }
    if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 2) { world.set(x, y, 60); world.set(x + 1, y, 8); return; }
    // 熔岩 + 冰/雪 → 岩浆岩 + 蒸汽（立即return）
    if (world.inBounds(x, y - 1) && (world.get(x, y - 1) === 14 || world.get(x, y - 1) === 15) && Math.random() < 0.3) {
      world.set(x, y, 77); world.set(x, y - 1, 8); world.wakeArea(x, y); world.wakeArea(x, y - 1); return;
    }
    if (world.inBounds(x, y + 1) && (world.get(x, y + 1) === 14 || world.get(x, y + 1) === 15) && Math.random() < 0.3) {
      world.set(x, y, 77); world.set(x, y + 1, 8); world.wakeArea(x, y); world.wakeArea(x, y + 1); return;
    }
    if (world.inBounds(x - 1, y) && (world.get(x - 1, y) === 14 || world.get(x - 1, y) === 15) && Math.random() < 0.3) {
      world.set(x, y, 77); world.set(x - 1, y, 8); world.wakeArea(x, y); world.wakeArea(x - 1, y); return;
    }
    if (world.inBounds(x + 1, y) && (world.get(x + 1, y) === 14 || world.get(x + 1, y) === 15) && Math.random() < 0.3) {
      world.set(x, y, 77); world.set(x + 1, y, 8); world.wakeArea(x, y); world.wakeArea(x + 1, y); return;
    }
    // 点燃可燃物（不return）
    if (world.inBounds(x, y - 1) && FLAMMABLE.has(world.get(x, y - 1)) && Math.random() < 0.1) { world.set(x, y - 1, 6); world.markUpdated(x, y - 1); }
    if (world.inBounds(x, y + 1) && FLAMMABLE.has(world.get(x, y + 1)) && Math.random() < 0.1) { world.set(x, y + 1, 6); world.markUpdated(x, y + 1); }
    if (world.inBounds(x - 1, y) && FLAMMABLE.has(world.get(x - 1, y)) && Math.random() < 0.1) { world.set(x - 1, y, 6); world.markUpdated(x - 1, y); }
    if (world.inBounds(x + 1, y) && FLAMMABLE.has(world.get(x + 1, y)) && Math.random() < 0.1) { world.set(x + 1, y, 6); world.markUpdated(x + 1, y); }

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
