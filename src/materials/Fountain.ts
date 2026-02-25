import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 喷泉 —— 持续生成水的源头
 * 不可移动的固体，每帧在上方空位生成水粒子
 * 可搭配虚空做排水口，形成水循环
 */
export const Fountain: MaterialDef = {
  id: 39,
  name: '喷泉',
  color() {
    // 青蓝色石质外观
    const t = Math.random();
    const r = 40 + Math.floor(t * 15);
    const g = 100 + Math.floor(t * 20);
    const b = 160 + Math.floor(t * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // 每帧 40% 概率生成水，避免瞬间淹没
    if (Math.random() > 0.4) return;

    // 优先在正上方生成
    if (y > 0 && world.isEmpty(x, y - 1)) {
      world.set(x, y - 1, 2); // 水
      world.markUpdated(x, y - 1);
      return;
    }

    // 上方被占 → 尝试左上/右上
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      const ny = y - 1;
      if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
        world.set(nx, ny, 2);
        world.markUpdated(nx, ny);
        return;
      }
    }
  },
};

registerMaterial(Fountain);
