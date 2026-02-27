import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 沙金 —— 河流中的天然金粉
 * - 粉末类，受重力影响，密度较高（比沙子重）
 * - 在水(2)/盐水(24)中缓慢沉降
 * - 遇炼金石(30)转化为金(31)
 * - 遇熔岩(11)高温熔化为金(31)
 * - 视觉上呈金黄色闪烁颗粒
 */

export const GoldDust: MaterialDef = {
  id: 103,
  name: '沙金',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 金黄色
      r = 220 + Math.floor(Math.random() * 35);
      g = 180 + Math.floor(Math.random() * 30);
      b = 40 + Math.floor(Math.random() * 30);
    } else if (t < 0.8) {
      // 深金色
      r = 190 + Math.floor(Math.random() * 25);
      g = 150 + Math.floor(Math.random() * 25);
      b = 20 + Math.floor(Math.random() * 20);
    } else {
      // 闪光高光
      r = 250 + Math.floor(Math.random() * 5);
      g = 230 + Math.floor(Math.random() * 15);
      b = 100 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化为金
    if (temp > 200) {
      world.set(x, y, 31); // 金
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇炼金石转化为金
      if (nid === 30 && Math.random() < 0.05) {
        world.set(x, y, 31); // 金
        world.wakeArea(x, y);
        return;
      }

      // 遇熔岩高温熔化
      if (nid === 11 && Math.random() < 0.08) {
        world.set(x, y, 31); // 金
        world.wakeArea(x, y);
        return;
      }

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.05) {
        world.set(x, y, 0);
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

      // 密度置换（在液体中沉降）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜向滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
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

registerMaterial(GoldDust);
