import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 硫化氢 —— 有毒可燃气体，臭鸡蛋味
 * - 气体，密度 -0.3（上升，比空气略重）
 * - 剧毒：接触水(2) → 弱酸化（小概率变酸液9）
 * - 可燃：接触火(6)/熔岩(11) → 燃烧为火(6)+烟(7)
 * - 高温(>260°) → 自燃
 * - 接触金属(10) → 腐蚀为铁锈(72)
 * - 淡黄色半透明
 */

export const HydrogenSulfide: MaterialDef = {
  id: 318,
  name: '硫化氢',
  category: '气体',
  description: '有毒可燃气体，臭鸡蛋味',
  density: -0.3,
  color() {
    const r = 200 + Math.floor(Math.random() * 30);
    const g = 195 + Math.floor(Math.random() * 25);
    const b = 120 + Math.floor(Math.random() * 30);
    const a = 70 + Math.floor(Math.random() * 40);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃
    if (temp > 260) {
      world.set(x, y, 6);
      world.setTemp(x, y, 350);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 可燃：遇火燃烧
      if ((nid === 6 || nid === 11) && Math.random() < 0.85) {
        world.set(x, y, 6);
        world.setTemp(x, y, 350);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀金属
      if (nid === 10 && Math.random() < 0.01) {
        world.set(nx, ny, 72); // 铁锈
        world.wakeArea(nx, ny);
      }

      // 弱酸化水
      if (nid === 2 && Math.random() < 0.008) {
        world.set(nx, ny, 9); // 酸液
        world.markUpdated(nx, ny);
      }
    }

    // 气体上升（较慢）
    if (y <= 0) return;
    if (world.isEmpty(x, y - 1) && Math.random() < 0.6) {
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
    if (Math.random() < 0.002) {
      world.set(x, y, 0);
    }
  },
};

registerMaterial(HydrogenSulfide);
