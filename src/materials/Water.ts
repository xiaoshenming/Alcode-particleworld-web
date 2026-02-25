import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 水 —— 液体类，受重力影响，可水平流动 */
export const Water: MaterialDef = {
  id: 2,
  name: '水',
  color() {
    const r = 30 + Math.floor(Math.random() * 10);
    const g = 100 + Math.floor(Math.random() * 20);
    const b = 200 + Math.floor(Math.random() * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2,
  update(x: number, y: number, world: WorldAPI) {
    if (y >= world.height - 1) return;

    // 1. 尝试直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 尝试斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    const nx1 = x + dir;
    const nx2 = x - dir;

    if (world.inBounds(nx1, y + 1) && world.isEmpty(nx1, y + 1)) {
      world.swap(x, y, nx1, y + 1);
      world.markUpdated(nx1, y + 1);
      return;
    }
    if (world.inBounds(nx2, y + 1) && world.isEmpty(nx2, y + 1)) {
      world.swap(x, y, nx2, y + 1);
      world.markUpdated(nx2, y + 1);
      return;
    }

    // 3. 水平流动（液体特有行为）
    const spread = 3 + Math.floor(Math.random() * 3); // 流动距离
    for (let d = 1; d <= spread; d++) {
      const sx = x + dir * d;
      if (!world.inBounds(sx, y)) break;
      if (world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
      if (!world.isEmpty(sx, y)) break; // 遇到障碍停止
    }
    // 反方向尝试
    for (let d = 1; d <= spread; d++) {
      const sx = x - dir * d;
      if (!world.inBounds(sx, y)) break;
      if (world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
      if (!world.isEmpty(sx, y)) break;
    }
  },
};

registerMaterial(Water);
