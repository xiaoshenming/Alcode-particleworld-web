import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 油 —— 液体，密度比水低（浮在水面），可燃 */
export const Oil: MaterialDef = {
  id: 5,
  name: '油',
  color() {
    const r = 60 + Math.floor(Math.random() * 15);
    const g = 40 + Math.floor(Math.random() * 10);
    const b = 10 + Math.floor(Math.random() * 8);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.5,
  update(x: number, y: number, world: WorldAPI) {
    if (y >= world.height - 1) return;

    // 1. 直接下落（空气或密度更低的）
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 斜下
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

    // 3. 水平流动（比水流动更快）
    const spread = 4 + Math.floor(Math.random() * 3);
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

    // 4. 密度置换：油比水轻，如果下方是水则交换（油浮上来）
    if (world.getDensity(x, y + 1) > Oil.density && world.getDensity(x, y + 1) < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Oil);
