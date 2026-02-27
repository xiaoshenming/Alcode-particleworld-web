import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氙气 —— 重惰性气体
 * - 气体，密度 0.8（比空气重，比氩气重）
 * - 完全惰性：不与任何材质反应
 * - 通电发光：接触电线(44)/闪电(16)时发出蓝紫色光
 * - 缓慢下沉（重于空气）
 * - 无色（视觉上极淡蓝紫色调）
 * - 缓慢消散
 */

export const Xenon: MaterialDef = {
  id: 263,
  name: '氙气',
  category: '气体',
  color() {
    const base = 190 + Math.floor(Math.random() * 40);
    const r = base + 5;
    const g = base - 15;
    const b = base + 15;
    const a = 0x38 + Math.floor(Math.random() * 0x20);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.8,
  update(x: number, y: number, world: WorldAPI) {
    // 缓慢消散
    if (Math.random() < 0.002) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    let glowing = false;
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触电线/闪电/电弧 → 发光（刷新颜色使其更亮）
      if (nid === 44 || nid === 16 || nid === 145) {
        glowing = true;
      }
    }

    // 发光效果：重新设置颜色为亮蓝紫
    if (glowing) {
      world.set(x, y, 263); // 刷新颜色
    }

    // === 气体运动 ===
    // 较重，倾向下沉
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.15) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
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

    // 偶尔上升
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.05) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Xenon);
