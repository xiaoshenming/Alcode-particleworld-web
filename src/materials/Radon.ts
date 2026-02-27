import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氡气 —— 放射性惰性气体
 * - 气体，密度 -0.05（比空气略重，缓慢下沉）
 * - 放射性：缓慢衰变，周围粒子被辐射加热
 * - 接触水 → 污染为沼泽(54)
 * - 自然衰变消散
 * - 无色（视觉上极淡绿色调，表示放射性）
 */

export const Radon: MaterialDef = {
  id: 273,
  name: '氡气',
  category: '气体',
  description: '放射性惰性气体，缓慢衰变并辐射加热周围',
  color() {
    const base = 180 + Math.floor(Math.random() * 40);
    const r = base - 15;
    const g = base + 10;
    const b = base - 20;
    const a = 0x30 + Math.floor(Math.random() * 0x25);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: -0.05,
  update(x: number, y: number, world: WorldAPI) {
    // 自然衰变消散
    if (Math.random() < 0.005) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 放射性：加热周围粒子
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.08) {
        world.addTemp(nx, ny, 2);
      }

      // 接触水 → 污染为沼泽
      if (nid === 2 && Math.random() < 0.02) {
        world.set(nx, ny, 54);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 接触植物/苔藓 → 杀死变为烟
      if ((nid === 13 || nid === 49) && Math.random() < 0.03) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动：略重于空气，缓慢下沉 ===
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.12) {
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
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.05) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Radon);
