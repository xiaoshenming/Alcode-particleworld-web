import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 一氧化碳 —— 无色有毒可燃气体
 * - 气体，密度 0.25（比空气略轻）
 * - 可燃：遇火/火花燃烧生成二氧化碳（消失为空气）
 * - 有毒：杀灭蚂蚁(40)、萤火虫(52)等生物
 * - 还原性：可还原铁锈(72)为金属(10)
 * - 无色（极淡灰色，几乎透明）
 */

/** 可被CO毒杀的生物 */
const TOXIC_TARGETS = new Set([40, 52, 100]); // 蚂蚁、萤火虫、蘑菇

export const CarbonMonoxide: MaterialDef = {
  id: 233,
  name: '一氧化碳',
  color() {
    // 几乎无色，极淡灰
    const base = 200 + Math.floor(Math.random() * 40);
    const r = base;
    const g = base + 2;
    const b = base + 5;
    // 半透明效果
    const a = 0x60 + Math.floor(Math.random() * 0x30);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.25,
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
      if ((nid === 6 || nid === 28 || nid === 55) && Math.random() < 0.4) {
        world.set(x, y, 6); // 短暂火焰
        world.wakeArea(x, y);
        return;
      }

      // 毒杀生物
      if (TOXIC_TARGETS.has(nid) && Math.random() < 0.04) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 还原铁锈为金属
      if (nid === 72 && Math.random() < 0.01) {
        world.set(nx, ny, 10); // 金属
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 0); // CO被氧化消失
        return;
      }
    }

    // === 气体上升 ===
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.3) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    if (y > 0 && Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
    }

    // 横向扩散
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
      }
    }
  },
};

registerMaterial(CarbonMonoxide);
