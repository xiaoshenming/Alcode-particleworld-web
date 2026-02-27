import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 酒精 —— 易燃液体，密度比水轻
 * - 极易燃：遇火(6)/火花(28)/熔岩(11)立即点燃变为蓝色火焰
 * - 缓慢蒸发（变为空气）
 * - 遇水(2)混合（概率性变为水）
 * - 无色透明偏蓝的液体
 */

/** 点燃源 */
const IGNITORS = new Set([6, 28, 11]); // 火、火花、熔岩

export const Alcohol: MaterialDef = {
  id: 166,
  name: '酒精',
  color() {
    // 无色透明偏蓝
    const r = 180 + Math.floor(Math.random() * 20);
    const g = 200 + Math.floor(Math.random() * 20);
    const b = 230 + Math.floor(Math.random() * 20);
    return (0xB0 << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.3, // 比水(2.0)轻，浮在水面
  update(x: number, y: number, world: WorldAPI) {
    // 1. 检查邻居：点燃 / 混合
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火源立即点燃
      if (IGNITORS.has(nid)) {
        world.set(x, y, 6); // 变为火
        world.setTemp(x, y, 200);
        world.wakeArea(x, y);
        return;
      }

      // 遇水混合（概率性变为水）
      if (nid === 2 && Math.random() < 0.02) {
        world.set(x, y, 2);
        world.wakeArea(x, y);
        return;
      }
    }

    // 2. 高温自燃（温度 > 200°）
    if (world.getTemp(x, y) > 200) {
      world.set(x, y, 6);
      world.wakeArea(x, y);
      return;
    }

    // 3. 缓慢蒸发
    if (Math.random() < 0.0005) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    if (y >= world.height - 1) return;

    // 4. 液体流动：下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 5. 密度置换：酒精比水轻，浮上来
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity > Alcohol.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 6. 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 7. 水平扩散
    const spread = 3 + Math.floor(Math.random() * 3);
    for (const d of [dir, -dir]) {
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

registerMaterial(Alcohol);
