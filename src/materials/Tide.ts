import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 潮汐 —— 周期性涌动的海水
 * - 液体，密度略高于水
 * - 有周期性的水平推力（模拟潮汐）
 * - 遇沙(1)侵蚀为泥(63)
 * - 遇盐(23)溶解为盐水(24)
 * - 视觉上呈深蓝绿色带白色泡沫
 */

let tidePhase = 0;

export const Tide: MaterialDef = {
  id: 137,
  name: '潮汐',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.1) {
      // 白色泡沫
      r = 220 + Math.floor(Math.random() * 30);
      g = 230 + Math.floor(Math.random() * 20);
      b = 240 + Math.floor(Math.random() * 15);
    } else if (t < 0.6) {
      // 深蓝绿
      r = 20 + Math.floor(Math.random() * 15);
      g = 80 + Math.floor(Math.random() * 20);
      b = 120 + Math.floor(Math.random() * 25);
    } else {
      // 中蓝
      r = 30 + Math.floor(Math.random() * 15);
      g = 95 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.2,
  update(x: number, y: number, world: WorldAPI) {
    // 更新潮汐相位
    tidePhase += 0.0001;

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 侵蚀沙子为泥浆
      if (nid === 1 && Math.random() < 0.005) {
        world.set(nx, ny, 63); // 泥浆
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 溶解盐
      if (nid === 23 && Math.random() < 0.02) {
        world.set(nx, ny, 24); // 盐水
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 液体下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
    }

    // 潮汐水平推力
    const tidePush = Math.sin(tidePhase * 50 + y * 0.1) > 0 ? 1 : -1;
    const wind = world.getWind();
    const pushDir = wind !== 0 ? wind : tidePush;

    // 斜下流动
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

    // 水平流动（受潮汐推力影响）
    if (Math.random() < 0.5) {
      const px = x + pushDir;
      if (world.inBounds(px, y) && world.isEmpty(px, y)) {
        world.swap(x, y, px, y);
        world.markUpdated(px, y);
        world.wakeArea(px, y);
        return;
      }
    }

    // 普通水平扩散
    for (const d of [dir, -dir]) {
      const sx = x + d;
      if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        world.wakeArea(sx, y);
        return;
      }
    }
  },
};

registerMaterial(Tide);
