import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 盐水 —— 液体类，比纯水略重
 * - 蒸发时析出盐粒（高温 → 蒸汽 + 盐）
 * - 低温结冰（比纯水更难结冰）
 * - 流动行为类似水
 */
export const Saltwater: MaterialDef = {
  id: 24,
  name: '盐水',
  color() {
    const r = 50 + Math.floor(Math.random() * 10);
    const g = 120 + Math.floor(Math.random() * 15);
    const b = 180 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 偏暗蓝绿
  },
  density: 2.5, // 比纯水(2)重
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发：盐水 → 蒸汽 + 析出盐
    if (temp > 90) {
      world.set(x, y, 8); // 蒸汽
      world.setTemp(x, y, 60);
      // 在附近空位析出盐粒
      if (Math.random() < 0.5) {
        const neighbors: [number, number][] = [
          [x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
            world.set(nx, ny, 23); // 盐
            break;
          }
        }
      }
      return;
    }

    // 低温结冰（比纯水更难，需要 -20°）
    if (temp < -20) {
      world.set(x, y, 14); // 冰
      return;
    }

    if (y >= world.height - 1) return;

    // 下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换：盐水比纯水重，沉入纯水下方
    const belowId = world.get(x, y + 1);
    if (belowId === 2) { // 纯水
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

    // 水平流动
    const spread = 3 + Math.floor(Math.random() * 2);
        {
      const d = dir;
      for (let i = 1; i <= spread; i++) {
        const sx = x + d * i;
        if (!world.inBounds(sx, y)) break;
        if (world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
        if (!world.isEmpty(sx, y)) break;
      }
    }
    {
      const d = -dir;
      for (let i = 1; i <= spread; i++) {
        const sx = x + d * i;
        if (!world.inBounds(sx, y)) break;
        if (world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
        if (!world.isEmpty(sx, y)) break;
      }
    }
  },
};

registerMaterial(Saltwater);
