import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 黑火药 —— 传统火药混合物
 * - 粉末，中等密度
 * - 遇火(6)/火花(28)/电弧(145)立即爆炸
 * - 爆炸范围比普通火药(22)更大
 * - 产生大量烟(7)和火花(28)
 * - 遇水(2)失效变为泥土(20)
 * - 视觉上呈黑灰色粉末
 */

export const BlackPowder: MaterialDef = {
  id: 155,
  name: '黑火药',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 30 + Math.floor(Math.random() * 10);
      g = 28 + Math.floor(Math.random() * 10);
      b = 25 + Math.floor(Math.random() * 10);
    } else if (t < 0.8) {
      r = 40 + Math.floor(Math.random() * 10);
      g = 38 + Math.floor(Math.random() * 10);
      b = 35 + Math.floor(Math.random() * 10);
    } else {
      // 灰色颗粒
      r = 55 + Math.floor(Math.random() * 10);
      g = 52 + Math.floor(Math.random() * 10);
      b = 48 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火/火花/电弧爆炸
      if ((nid === 6 || nid === 28 || nid === 145) && Math.random() < 0.4) {
        // 大范围爆炸
        for (let ey = -2; ey <= 2; ey++) {
          for (let ex = -2; ex <= 2; ex++) {
            const bx = x + ex, by = y + ey;
            if (!world.inBounds(bx, by)) continue;
            const bid = world.get(bx, by);
            if (bid === 155) {
              // 链式反应
              world.set(bx, by, 6);
              world.markUpdated(bx, by);
              world.wakeArea(bx, by);
            } else if (bid === 0) {
              world.set(bx, by, Math.random() < 0.3 ? 28 : 7); // 火花或烟
              world.markUpdated(bx, by);
              world.wakeArea(bx, by);
            }
          }
        }
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }

      // 遇水失效
      if (nid === 2 && Math.random() < 0.02) {
        world.set(x, y, 20); // 泥土
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

registerMaterial(BlackPowder);
