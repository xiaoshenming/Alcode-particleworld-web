import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 石灰水 —— Ca(OH)2 溶液
 * - 液体，密度 1.6
 * - 碱性：遇酸(9)中和为盐水(24)
 * - 遇烟(7)变浑浊（概率变为石灰124粒子，模拟CO2反应）
 * - 遇蒸汽(8)也有类似反应但更弱
 * - 乳白色半透明液体
 */

export const Limewater: MaterialDef = {
  id: 178,
  name: '石灰水',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 乳白色
      r = 220 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 18);
      b = 230 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 偏青白
      r = 200 + Math.floor(Math.random() * 15);
      g = 215 + Math.floor(Math.random() * 15);
      b = 225 + Math.floor(Math.random() * 20);
    } else {
      // 微黄白（石灰质感）
      r = 230 + Math.floor(Math.random() * 15);
      g = 228 + Math.floor(Math.random() * 12);
      b = 210 + Math.floor(Math.random() * 15);
    }
    // 半透明
    return (0xDD << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.6,
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸液中和 → 盐水
      if (nid === 9) {
        world.set(x, y, 24); // 盐水
        world.set(nx, ny, 24); // 酸也变盐水
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇烟(CO2) → 变浑浊，生成石灰沉淀
      if (nid === 7 && Math.random() < 0.08) {
        world.set(x, y, 124); // 石灰（CaCO3沉淀）
        world.set(nx, ny, 0); // 烟消失
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇蒸汽 → 弱反应（蒸汽中可能含CO2）
      if (nid === 8 && Math.random() < 0.02) {
        world.set(x, y, 124); // 石灰沉淀
        world.set(nx, ny, 0); // 蒸汽消失
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 液体流动逻辑
    if (y >= world.height - 1) return;

    // 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换（沉入更轻的液体）
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 1.6 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
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
      return;
    }

    // 水平流动
    const spread = 2 + Math.floor(Math.random() * 3);
    for (let d = 1; d <= spread; d++) {
      const sx = x + dir * d;
      if (!world.inBounds(sx, y)) break;
      if (world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
      if (!world.isEmpty(sx, y)) break;
    }
    // 反方向
    for (let d = 1; d <= spread; d++) {
      const sx = x - dir * d;
      if (!world.inBounds(sx, y)) break;
      if (world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
      if (!world.isEmpty(sx, y)) break;
    }
  },
};

registerMaterial(Limewater);
