import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硝石 —— 硝酸钾矿物
 * - 粉末，中等密度
 * - 强氧化剂：遇火(6)/火花(28)剧烈燃烧爆炸
 * - 遇水(2)溶解消失
 * - 与木炭(46)+硫磺(66)混合=黑火药效果
 * - 视觉上呈白色针状结晶
 */

export const Niter: MaterialDef = {
  id: 150,
  name: '硝石',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 230 + Math.floor(Math.random() * 20);
      g = 232 + Math.floor(Math.random() * 18);
      b = 235 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 220 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 15);
      b = 228 + Math.floor(Math.random() * 12);
    } else {
      // 微黄
      r = 235 + Math.floor(Math.random() * 15);
      g = 230 + Math.floor(Math.random() * 15);
      b = 215 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.8,
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火/火花爆炸
      if ((nid === 6 || nid === 28) && Math.random() < 0.2) {
        world.set(x, y, 6);
        // 爆炸扩散
        for (const [ex, ey] of dirs) {
          const bx = x + ex, by = y + ey;
          if (world.inBounds(bx, by)) {
            const bid = world.get(bx, by);
            if (bid === 0) {
              world.set(bx, by, Math.random() < 0.4 ? 6 : 7);
              world.markUpdated(bx, by);
              world.wakeArea(bx, by);
            } else if (bid === 150) {
              // 链式反应
              world.set(bx, by, 6);
              world.markUpdated(bx, by);
              world.wakeArea(bx, by);
            }
          }
        }
        world.wakeArea(x, y);
        return;
      }

      // 遇水溶解
      if (nid === 2 && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 与木炭+硫磺相邻时更易爆
      if ((nid === 46 || nid === 66) && Math.random() < 0.001) {
        world.set(x, y, 22); // 变为火药
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
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
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

registerMaterial(Niter);
