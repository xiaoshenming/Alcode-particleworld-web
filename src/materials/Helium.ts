import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氦气 —— 最轻的惰性气体
 * - 气体，密度 -0.9（极轻，快速上升）
 * - 惰性：不与任何材质反应
 * - 极低温(<-269°/4K)时变为液态氦(108)
 * - 无色透明，微弱可见
 */

export const Helium: MaterialDef = {
  id: 283,
  name: '氦气',
  category: '气体',
  color() {
    const r = 200 + Math.floor(Math.random() * 30);
    const g = 220 + Math.floor(Math.random() * 25);
    const b = 255;
    const a = 0x18 + Math.floor(Math.random() * 0x18);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: -0.9,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极低温液化
    if (temp < 4) {
      world.set(x, y, 108); // 液态氦
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 缓慢消散
    if (Math.random() < 0.001) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // === 气体运动：快速上升 ===
    if (y > 0 && world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上方
    const dir = Math.random() < 0.5 ? -1 : 1;
        {
      const d = dir;
      const nx = x + d;
      if (y > 0 && world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d;
      if (y > 0 && world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 横向扩散
    if (Math.random() < 0.3) {
      const d = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + d, y) && world.isEmpty(x + d, y)) {
        world.swap(x, y, x + d, y);
        world.markUpdated(x + d, y);
      }
    }
  },
};

registerMaterial(Helium);
