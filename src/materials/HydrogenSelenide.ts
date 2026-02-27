import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 硒化氢 —— 剧毒易燃气体
 * - 气体，密度 -0.18（较重气体）
 * - 极易燃：接触火(6)/熔岩(11) → 燃烧
 * - 高温(>200°) → 分解为烟(7)
 * - 接触水(2) → 缓慢溶解
 * - 无色微带蒜臭味（淡黄绿半透明）
 */

export const HydrogenSelenide: MaterialDef = {
  id: 338,
  name: '硒化氢',
  category: '气体',
  description: '剧毒易燃气体，有蒜臭味',
  density: -0.18,
  color() {
    const r = 190 + Math.floor(Math.random() * 25);
    const g = 200 + Math.floor(Math.random() * 25);
    const b = 140 + Math.floor(Math.random() * 20);
    const a = 40 + Math.floor(Math.random() * 25);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 200) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火燃烧
      if ((nid === 6 || nid === 11 || nid === 28) && Math.random() < 0.9) {
        world.set(x, y, 6);
        world.setTemp(x, y, 350);
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢溶解
      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 气体上升
    if (y <= 0) return;
    if (world.isEmpty(x, y - 1) && Math.random() < 0.45) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    for (let d = 1; d <= 2; d++) {
      const nx = x + (Math.random() < 0.5 ? d : -d);
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    if (Math.random() < 0.001) {
      world.set(x, y, 0);
    }
  },
};

registerMaterial(HydrogenSelenide);
