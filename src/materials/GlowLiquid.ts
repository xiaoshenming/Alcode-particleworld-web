import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 荧光液 —— 发光的神秘液体
 * - 液体，受重力影响，流动性好
 * - 持续发光（照亮周围区域，提升邻居亮度）
 * - 接触酸液时产生明亮闪光后消失
 * - 接触水时扩散（水变为荧光液）
 * - 高温（>200°）蒸发为发光蒸汽
 * - 视觉上呈亮绿色/青色，带有脉动效果
 */

export const GlowLiquid: MaterialDef = {
  id: 80,
  name: '荧光液',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 亮绿色
      r = 30 + Math.floor(Math.random() * 30);
      g = 220 + Math.floor(Math.random() * 35);
      b = 80 + Math.floor(Math.random() * 40);
    } else if (phase < 0.7) {
      // 青绿色
      r = 20 + Math.floor(Math.random() * 25);
      g = 200 + Math.floor(Math.random() * 30);
      b = 160 + Math.floor(Math.random() * 40);
    } else {
      // 亮白绿高光（脉动）
      r = 100 + Math.floor(Math.random() * 50);
      g = 240 + Math.floor(Math.random() * 15);
      b = 140 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.1, // 略重于水
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发
    if (temp > 200) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    // 颜色脉动（刷新颜色）
    if (Math.random() < 0.05) {
      world.set(x, y, 80);
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触酸液 → 闪光消失
      if (nid === 9) {
        world.set(x, y, 28); // 火花（闪光效果）
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 接触水 → 扩散（水变荧光液）
      if (nid === 2 && Math.random() < 0.01) {
        world.set(nx, ny, 80);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 重力下落
    if (y + 1 < world.height) {
      const belowId = world.get(x, y + 1);
      if (belowId === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 密度置换（沉入比自己轻的液体下方）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < GlowLiquid.density && belowDensity < Infinity) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下流动
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }

    // 水平流动
    if (Math.random() < 0.5) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

registerMaterial(GlowLiquid);
