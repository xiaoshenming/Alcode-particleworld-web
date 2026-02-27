import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 溴气 —— 红棕色腐蚀性气体
 * - 气体，密度 -0.05（较重气体，缓慢下沉）
 * - 腐蚀金属和有机物
 * - 接触水 → 产生酸
 * - 红棕色半透明
 */

export const Bromine: MaterialDef = {
  id: 288,
  name: '溴气',
  category: '气体',
  color() {
    const r = 160 + Math.floor(Math.random() * 40);
    const g = 40 + Math.floor(Math.random() * 30);
    const b = 20 + Math.floor(Math.random() * 20);
    const a = 0x30 + Math.floor(Math.random() * 0x20);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: -0.05,
  update(x: number, y: number, world: WorldAPI) {
    // 缓慢消散
    if (Math.random() < 0.0015) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水 → 酸
      if (nid === 2 && Math.random() < 0.1) {
        world.set(nx, ny, 9);
        world.set(x, y, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀有机物（木、植物）
      if ((nid === 4 || nid === 13 || nid === 49 || nid === 12) && Math.random() < 0.06) {
        world.set(nx, ny, 7); // 烟
        world.set(x, y, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀金属（较弱）
      if (nid === 10 && Math.random() < 0.015) {
        world.set(nx, ny, 7);
        world.set(x, y, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // === 气体运动：较重，缓慢下沉 ===
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.15) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 横向扩散
    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 偶尔上升
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.03) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Bromine);
