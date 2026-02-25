import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氖气 —— 轻惰性气体
 * - 气体，密度 -0.2（比空气轻，缓慢上升）
 * - 完全惰性：不与任何材质反应
 * - 通电发光：接触电线(44)/闪电(16)时发出橙红色光
 * - 缓慢上升消散
 * - 无色（视觉上极淡橙色调）
 */

export const Neon: MaterialDef = {
  id: 268,
  name: '氖气',
  category: '气体',
  color() {
    const base = 200 + Math.floor(Math.random() * 40);
    const r = base + 15;
    const g = base - 20;
    const b = base - 30;
    const a = 0x35 + Math.floor(Math.random() * 0x20);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: -0.2,
  update(x: number, y: number, world: WorldAPI) {
    // 缓慢消散
    if (Math.random() < 0.003) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻：通电发光
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触电源 → 刷新颜色（发光效果）
      if (nid === 44 || nid === 16 || nid === 145) {
        world.set(x, y, 268);
      }
    }

    // === 气体运动：轻于空气，上升 ===
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.2) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 横向扩散
    if (Math.random() < 0.25) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 偶尔下沉
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.03) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Neon);
