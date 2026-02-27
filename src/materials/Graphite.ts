import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 石墨 —— 碳的层状结构
 * - 固体，中等密度，可下落
 * - 导电：与电线(44)相邻时传递电信号
 * - 高温(>3600°)升华为烟(7)
 * - 可被火(6)缓慢燃烧
 * - 润滑性：减少邻居固体的摩擦（加速滑落）
 * - 视觉上呈深灰色带金属光泽
 */

export const Graphite: MaterialDef = {
  id: 141,
  name: '石墨',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 40 + Math.floor(Math.random() * 15);
      g = 42 + Math.floor(Math.random() * 15);
      b = 48 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 金属光泽
      r = 55 + Math.floor(Math.random() * 15);
      g = 58 + Math.floor(Math.random() * 15);
      b = 62 + Math.floor(Math.random() * 15);
    } else {
      r = 30 + Math.floor(Math.random() * 10);
      g = 32 + Math.floor(Math.random() * 10);
      b = 36 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温升华
    if (temp > 3600) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火缓慢燃烧
      if (nid === 6 && Math.random() < 0.005) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && temp > 25 && Math.random() < 0.1) {
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 3) {
          world.addTemp(x, y, -1);
          world.addTemp(nx, ny, 1);
        }
      }
    }

    // 粉末下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0 && Math.random() < 0.3) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Graphite);
