import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 雪球 —— 可投掷的压实雪块
 * - 粉末类，受重力影响，密度比沙子轻
 * - 碰撞固体时碎裂为雪(15)
 * - 遇火/熔岩/高温融化为水(2)
 * - 遇冰(14)时不碎裂，堆积
 * - 视觉上呈亮白色带蓝色阴影
 */

/** 点火源 */
const HOT = new Set([6, 11, 28, 55]); // 火、熔岩、火花、等离子体

/** 碰撞时不碎裂的材质（可堆积） */
const SOFT = new Set([0, 15, 14, 101]); // 空气、雪、冰、雪球自身

export const Snowball: MaterialDef = {
  id: 101,
  name: '雪球',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.6) {
      // 亮白色
      r = 230 + Math.floor(Math.random() * 25);
      g = 235 + Math.floor(Math.random() * 20);
      b = 245 + Math.floor(Math.random() * 10);
    } else if (t < 0.85) {
      // 淡蓝色阴影
      r = 200 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 20);
      b = 235 + Math.floor(Math.random() * 20);
    } else {
      // 冰晶高光
      r = 240 + Math.floor(Math.random() * 15);
      g = 245 + Math.floor(Math.random() * 10);
      b = 255;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化为水
    if (temp > 40) {
      world.set(x, y, 2); // 水
      world.wakeArea(x, y);
      return;
    }

    // 邻居检测：遇热源融化
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (HOT.has(nid)) {
        world.set(x, y, 2); // 融化为水
        world.wakeArea(x, y);
        return;
      }
    }

    // 重力下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 碰撞非软材质 → 碎裂为雪
      if (!SOFT.has(below)) {
        world.set(x, y, 15); // 碎裂为雪
        world.wakeArea(x, y);
        return;
      }

      // 密度置换液体
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜向滑落
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

    // 缓慢降温周围
    if (Math.random() < 0.05) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny)) {
          world.addTemp(nx, ny, -0.5);
        }
      }
    }
  },
};

registerMaterial(Snowball);
