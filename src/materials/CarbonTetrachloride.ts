import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 四氯化碳 —— 无色有毒液体，曾用作灭火剂
 * - 液体，密度 1.6
 * - 灭火：接触火(6)/熔岩(11) → 产生烟(7)并消灭火源
 * - 有毒：接触植物(4/5) → 枯萎为沙(1)
 * - 高温(>76°) → 蒸发为有毒气体(烟7)
 * - 无色透明液体
 */

export const CarbonTetrachloride: MaterialDef = {
  id: 358,
  name: '四氯化碳',
  category: '液体',
  description: '无色有毒液体，优良灭火剂，接触火焰立即扑灭',
  density: 1.6,
  color() {
    const r = 180 + Math.floor(Math.random() * 20);
    const g = 195 + Math.floor(Math.random() * 20);
    const b = 210 + Math.floor(Math.random() * 20);
    const a = 100 + Math.floor(Math.random() * 30);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 蒸发
    if (temp > 76) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 灭火
      if (nid === 6 && Math.random() < 0.9) {
        world.set(nx, ny, 7);
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }

      // 冷却熔岩
      if (nid === 11 && Math.random() < 0.3) {
        world.set(nx, ny, 3); // 石
        world.set(x, y, 7);
        world.addTemp(nx, ny, -200);
        world.wakeArea(x, y);
        return;
      }

      // 毒杀植物
      if ((nid === 4 || nid === 5) && Math.random() < 0.05) {
        world.set(nx, ny, 1); // 沙
        world.wakeArea(nx, ny);
      }
    }

    if (y >= world.height - 1) return;

    // 下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换（比水重）
    if (y < world.height - 1) {
      const belowId = world.get(x, y + 1);
      if (belowId === 2 && Math.random() < 0.4) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 水平流动
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }
  },
};

registerMaterial(CarbonTetrachloride);
