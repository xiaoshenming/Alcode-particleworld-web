import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氟气 —— 剧毒强腐蚀性气体
 * - 气体，密度 -0.1（略重于空气，缓慢下沉）
 * - 极强腐蚀性：腐蚀几乎所有材质（金属、石头、玻璃）
 * - 接触水 → 产生酸(9)
 * - 接触有机物（木、植物）→ 起火
 * - 淡黄绿色
 */

export const Fluorine: MaterialDef = {
  id: 278,
  name: '氟气',
  category: '气体',
  color() {
    const base = 180 + Math.floor(Math.random() * 40);
    const r = base - 30;
    const g = base + 5;
    const b = base - 50;
    const a = 0x38 + Math.floor(Math.random() * 0x20);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: -0.1,
  update(x: number, y: number, world: WorldAPI) {
    // 缓慢消散
    if (Math.random() < 0.002) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水 → 产生酸
      if (nid === 2 && Math.random() < 0.15) {
        world.set(nx, ny, 9);
        world.set(x, y, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 接触有机物 → 起火
      if ((nid === 4 || nid === 13 || nid === 49 || nid === 12) && Math.random() < 0.1) {
        world.set(nx, ny, 6); // 火
        world.set(x, y, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀金属
      if ((nid === 10 || nid === 17) && Math.random() < 0.03) {
        world.set(nx, ny, 7); // 烟
        world.set(x, y, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        return;
      }

      // 腐蚀玻璃
      if (nid === 17 && Math.random() < 0.04) {
        world.set(nx, ny, 1); // 沙
        world.set(x, y, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        return;
      }

      // 腐蚀石头
      if (nid === 3 && Math.random() < 0.01) {
        world.set(nx, ny, 7);
        world.set(x, y, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // === 气体运动：略重于空气，缓慢下沉 ===
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.1) {
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
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.04) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Fluorine);
