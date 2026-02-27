import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 种子 —— 粉末类，受重力下落
 * 落在固体上且旁边有水时，生长为植物
 */

export const Seed: MaterialDef = {
  id: 12,
  name: '种子',
  color() {
    const r = 100 + Math.floor(Math.random() * 20);
    const g = 80 + Math.floor(Math.random() * 15);
    const b = 30 + Math.floor(Math.random() * 10);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 棕色
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    // 检查是否有水在附近（上下左右）
    const hasWater = (
      (world.inBounds(x, y - 1) && world.get(x, y - 1) === 2) ||
      (world.inBounds(x, y + 1) && world.get(x, y + 1) === 2) ||
      (world.inBounds(x - 1, y) && world.get(x - 1, y) === 2) ||
      (world.inBounds(x + 1, y) && world.get(x + 1, y) === 2)
    );

    // 检查是否落在固体上（下方不可移动）
    const onGround = y >= world.height - 1 ||
      (!world.isEmpty(x, y + 1) && world.getDensity(x, y + 1) >= Infinity);

    // 落地 + 有水 → 发芽为植物
    if (onGround && hasWater) {
      world.set(x, y, 13); // 变成植物
      return;
    }

    // 落地但无水 → 等待（小概率自然死亡）
    if (onGround) {
      if (Math.random() < 0.0005) {
        world.set(x, y, 0); // 枯死
      }
      return;
    }

    if (y >= world.height - 1) return;

    // 重力下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下滑落
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
  },
};

registerMaterial(Seed);
