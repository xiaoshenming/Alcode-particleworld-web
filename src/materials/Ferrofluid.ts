import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁流体 —— 受磁铁影响的液态金属悬浮液
 * - 液体，密度比水重
 * - 被磁铁(42)强力吸引，吸引半径比普通金属更大
 * - 无磁铁时正常流动，有磁铁时形成尖刺状聚集
 * - 接触电线(44)时产生火花
 * - 高温蒸发为烟，低温凝固为金属
 * - 视觉上呈深黑色带金属光泽
 */

/** 磁力作用半径 */
const ATTRACT_RADIUS = 12;

export const Ferrofluid: MaterialDef = {
  id: 96,
  name: '磁流体',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.6) {
      // 深黑色主体
      r = 20 + Math.floor(Math.random() * 15);
      g = 20 + Math.floor(Math.random() * 15);
      b = 25 + Math.floor(Math.random() * 15);
    } else if (t < 0.85) {
      // 金属高光
      r = 60 + Math.floor(Math.random() * 30);
      g = 55 + Math.floor(Math.random() * 25);
      b = 70 + Math.floor(Math.random() * 30);
    } else {
      // 蓝紫色反光
      r = 40 + Math.floor(Math.random() * 20);
      g = 30 + Math.floor(Math.random() * 15);
      b = 80 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.0, // 比水重，比水银轻
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发为烟
    if (temp > 180) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 低温凝固为金属
    if (temp < -20) {
      world.set(x, y, 10); // 金属
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触电线产生火花
      if (nid === 44 && Math.random() < 0.04) {
        const ox = x - dx, oy = y - dy;
        if (world.inBounds(ox, oy) && world.isEmpty(ox, oy)) {
          world.set(ox, oy, 28); // 火花
          world.markUpdated(ox, oy);
          world.wakeArea(ox, oy);
        }
      }
    }

    // 磁铁吸引：搜索范围内的磁铁并向其移动
    let magnetX = -1, magnetY = -1;
    let minDist = Infinity;

    for (let dy = -ATTRACT_RADIUS; dy <= ATTRACT_RADIUS; dy++) {
      for (let dx = -ATTRACT_RADIUS; dx <= ATTRACT_RADIUS; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > ATTRACT_RADIUS) continue;
        const tx = x + dx, ty = y + dy;
        if (!world.inBounds(tx, ty)) continue;
        if (world.get(tx, ty) === 42 && dist < minDist) {
          minDist = dist;
          magnetX = tx;
          magnetY = ty;
        }
      }
    }

    // 有磁铁时强力吸引
    if (magnetX >= 0) {
      const prob = 0.6 / Math.max(minDist, 1);
      if (Math.random() < prob) {
        const ddx = magnetX - x;
        const ddy = magnetY - y;
        const mx = x + (ddx > 0 ? 1 : ddx < 0 ? -1 : 0);
        const my = y + (ddy > 0 ? 1 : ddy < 0 ? -1 : 0);
        if (world.inBounds(mx, my) && !(mx === magnetX && my === magnetY)) {
          if (world.isEmpty(mx, my)) {
            world.swap(x, y, mx, my);
            world.markUpdated(mx, my);
            world.wakeArea(x, y);
            world.wakeArea(mx, my);
            return;
          }
          // 可以置换比自己轻的液体
          const targetDensity = world.getDensity(mx, my);
          if (targetDensity < Ferrofluid.density && targetDensity < Infinity && targetDensity > 0) {
            world.swap(x, y, mx, my);
            world.markUpdated(mx, my);
            world.wakeArea(x, y);
            world.wakeArea(mx, my);
            return;
          }
        }
      }
    }

    if (y >= world.height - 1) return;

    // 下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      world.wakeArea(x, y);
      world.wakeArea(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity < Ferrofluid.density && belowDensity < Infinity && belowDensity > 0) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      world.wakeArea(x, y);
      world.wakeArea(x, y + 1);
      return;
    }

    // 斜下流动
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(nx, y + 1);
        return;
      }
    }

    // 水平流动
    if (Math.random() < 0.3) {
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y);
          world.markUpdated(nx, y);
          world.wakeArea(x, y);
          world.wakeArea(nx, y);
          return;
        }
      }
    }
  },
};

registerMaterial(Ferrofluid);
