import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 溴化氢 —— 刺激性酸性气体
 * - 气体，密度 -0.15（上升较慢，比空气重）
 * - 强腐蚀：接触金属(10) → 铁锈(72)
 * - 遇水(2) → 酸液(9)（溴化氢溶于水成氢溴酸）
 * - 高温(>700°) → 分解为烟(7)
 * - 橙红色半透明
 */

export const HydrogenBromide: MaterialDef = {
  id: 323,
  name: '溴化氢',
  category: '气体',
  description: '刺激性酸性气体',
  density: -0.15,
  color() {
    const r = 210 + Math.floor(Math.random() * 30);
    const g = 120 + Math.floor(Math.random() * 30);
    const b = 80 + Math.floor(Math.random() * 20);
    const a = 65 + Math.floor(Math.random() * 40);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 700) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水变酸液
      if (nid === 2 && Math.random() < 0.15) {
        world.set(x, y, 0);
        world.set(nx, ny, 9); // 酸液
        world.wakeArea(nx, ny);
        return;
      }

      // 腐蚀金属
      if (nid === 10 && Math.random() < 0.015) {
        world.set(nx, ny, 72); // 铁锈
        world.wakeArea(nx, ny);
      }

      // 腐蚀木头
      if (nid === 4 && Math.random() < 0.008) {
        world.set(nx, ny, 7); // 烟
        world.wakeArea(nx, ny);
      }
    }

    // 气体上升
    if (y <= 0) return;
    if (world.isEmpty(x, y - 1) && Math.random() < 0.5) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 水平扩散
    for (let d = 1; d <= 2; d++) {
      const nx = x + (Math.random() < 0.5 ? d : -d);
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 自然消散
    if (Math.random() < 0.0015) {
      world.set(x, y, 0);
    }
  },
};

registerMaterial(HydrogenBromide);
