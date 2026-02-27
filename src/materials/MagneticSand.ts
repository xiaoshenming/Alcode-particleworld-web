import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磁沙 —— 含磁铁矿的黑色沙粒
 * - 粉末，高密度
 * - 被磁铁(42)吸引：靠近磁铁时向其移动
 * - 遇熔岩(11)变为岩浆岩(77)
 * - 导电：与电线(44)交互
 * - 视觉上呈黑色带金属光泽
 */

export const MagneticSand: MaterialDef = {
  id: 147,
  name: '磁沙',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 25 + Math.floor(Math.random() * 10);
      g = 25 + Math.floor(Math.random() * 10);
      b = 30 + Math.floor(Math.random() * 10);
    } else if (t < 0.8) {
      // 金属光泽
      r = 40 + Math.floor(Math.random() * 15);
      g = 40 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 15);
    } else {
      r = 15 + Math.floor(Math.random() * 10);
      g = 15 + Math.floor(Math.random() * 10);
      b = 20 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 5.0,
  update(x: number, y: number, world: WorldAPI) {
    // 搜索附近磁铁（范围5格）
    let magnetX = -1, magnetY = -1, minDist = 999;
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) === 42) {
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist < minDist) {
            minDist = dist;
            magnetX = nx;
            magnetY = ny;
          }
        }
      }
    }

    // 被磁铁吸引
    if (magnetX >= 0 && Math.random() < 0.3) {
      const dx = magnetX > x ? 1 : magnetX < x ? -1 : 0;
      const dy = magnetY > y ? 1 : magnetY < y ? -1 : 0;
      const nx = x + dx, ny = y + dy;
      if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
        world.swap(x, y, nx, ny);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇熔岩变岩浆岩
      if (nid === 11 && Math.random() < 0.03) {
        world.set(x, y, 77);
        world.wakeArea(x, y);
        return;
      }
    }

    // 粉末下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0 && Math.random() < 0.3) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(MagneticSand);
