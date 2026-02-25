import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 沙子 —— 粉末类，受重力影响，可堆积 */
export const Sand: MaterialDef = {
  id: 1,
  name: '沙子',
  color() {
    // 沙黄色带随机变化，增加视觉层次
    const r = 194 + Math.floor(Math.random() * 20);
    const g = 178 + Math.floor(Math.random() * 15);
    const b = 128 + Math.floor(Math.random() * 10);
    // ABGR 格式
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3,
  update(x: number, y: number, world: WorldAPI) {
    // 已经在底部
    if (y >= world.height - 1) return;

    // 1. 尝试直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 尝试左下或右下（随机先后避免偏向）
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
    }
  },
};

registerMaterial(Sand);
