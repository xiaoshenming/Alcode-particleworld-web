import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 甲醛 —— 刺激性气体/液体
 * - 气体，密度 0.25（比空气略重，缓慢上升）
 * - 可燃：遇火(6)/火花(28)燃烧产生火焰
 * - 遇水溶解（变为水，模拟福尔马林）
 * - 有毒：接触生物材质（植物13、苔藓49等）使其枯萎
 * - 自然消散
 */

export const Formaldehyde: MaterialDef = {
  id: 218,
  name: '甲醛',
  color() {
    // 几乎无色，微微泛白
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.7) {
      r = 215 + Math.floor(Math.random() * 25);
      g = 220 + Math.floor(Math.random() * 25);
      b = 225 + Math.floor(Math.random() * 25);
    } else {
      r = 200 + Math.floor(Math.random() * 30);
      g = 208 + Math.floor(Math.random() * 25);
      b = 215 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.25,
  update(x: number, y: number, world: WorldAPI) {
    // 自然消散
    if (Math.random() < 0.006) {
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

      // 遇火燃烧
      if ((nid === 6 || nid === 28) && Math.random() < 0.3) {
        world.set(x, y, 6); // 着火
        world.wakeArea(x, y);
        return;
      }

      // 遇水溶解
      if (nid === 2 && Math.random() < 0.1) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 毒害生物材质
      if ((nid === 13 || nid === 49 || nid === 57 || nid === 100) && Math.random() < 0.05) {
        world.set(nx, ny, 7); // 枯萎为烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体上升逻辑 ===
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.35) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上
    if (y > 0 && Math.random() < 0.25) {
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

registerMaterial(Formaldehyde);
