import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 通电发光源 */
const ELECTRIC = new Set([44, 16, 145]); // 电线、闪电、电弧

/**
 * 氪气 —— 惰性气体，通电发出白绿色光
 * - 气体，密度 -0.15（比空气轻，缓慢上升）
 * - 完全惰性，不与其他材质反应
 * - 接触电线/闪电/电弧时刷新颜色（发光效果）
 * - 极淡绿白色，半透明
 */

export const Krypton: MaterialDef = {
  id: 293,
  name: '氪气',
  category: '气体',
  description: '惰性气体，通电发出白绿色光',
  color() {
    const r = 200 + Math.floor(Math.random() * 40);
    const g = 240 + Math.floor(Math.random() * 16);
    const b = 210 + Math.floor(Math.random() * 30);
    const a = 0x30 + Math.floor(Math.random() * 0x21); // 0x30~0x50
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: -0.15,
  update(x: number, y: number, world: WorldAPI) {
    // 缓慢消散
    if (Math.random() < 0.002) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 通电发光：接触电源时刷新自身颜色
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
      [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      if (ELECTRIC.has(world.get(nx, ny))) {
        // 重新 set 自身 ID，触发颜色刷新（发光闪烁）
        world.set(x, y, 293);
        world.markUpdated(x, y);
        world.wakeArea(x, y);
        break;
      }
    }

    // === 气体运动 ===

    // 上升（概率 0.2）
    if (Math.random() < 0.2 && y > 0 && world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上方
    if (Math.random() < 0.15 && y > 0) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 横向扩散（概率 0.25）
    if (Math.random() < 0.25) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 偶尔下沉（概率 0.03）
    if (Math.random() < 0.03 && y < world.height - 1 && world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Krypton);
