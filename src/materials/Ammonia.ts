import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氨气 —— 刺激性碱性气体
 * - 气体，密度 0.2（比空气轻，快速上升）
 * - 遇水溶解为碱液(167/Lye)
 * - 遇酸中和反应：产生盐(23)和烟
 * - 可燃：遇火燃烧产生火焰
 * - 无色，微微泛白
 */

export const Ammonia: MaterialDef = {
  id: 223,
  name: '氨气',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.7) {
      r = 210 + Math.floor(Math.random() * 25);
      g = 215 + Math.floor(Math.random() * 25);
      b = 225 + Math.floor(Math.random() * 25);
    } else {
      r = 195 + Math.floor(Math.random() * 30);
      g = 205 + Math.floor(Math.random() * 25);
      b = 220 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.2,
  update(x: number, y: number, world: WorldAPI) {
    // 自然消散
    if (Math.random() < 0.005) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火燃烧
      if ((nid === 6 || nid === 28) && Math.random() < 0.25) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }

      // 遇水溶解为碱液
      if (nid === 2 && Math.random() < 0.08) {
        world.set(x, y, 0);
        world.set(nx, ny, 167); // 碱液
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 遇酸中和
      if ((nid === 9 || nid === 173 || nid === 183 || nid === 159) && Math.random() < 0.1) {
        world.set(x, y, 0);
        world.set(nx, ny, 23); // 盐
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }

    // === 气体快速上升 ===
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.5) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上
    if (y > 0 && Math.random() < 0.35) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
    }

    // 水平扩散
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
      }
    }
  },
};

registerMaterial(Ammonia);
