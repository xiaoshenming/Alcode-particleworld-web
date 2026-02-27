import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 甲硅烷 —— 自燃性气体，半导体工业原料
 * - 气体，密度 -0.25（上升）
 * - 极易自燃：接触空气中的火(6)/熔岩(11) → 爆燃
 * - 高温(>100°) → 自燃为火(6)+烟(7)
 * - 接触水(2) → 分解为烟(7)
 * - 无色微带黄绿的半透明
 */

export const Silane: MaterialDef = {
  id: 328,
  name: '甲硅烷',
  category: '气体',
  description: '自燃性气体，半导体工业原料',
  density: -0.25,
  color() {
    const r = 180 + Math.floor(Math.random() * 25);
    const g = 200 + Math.floor(Math.random() * 25);
    const b = 150 + Math.floor(Math.random() * 20);
    const a = 50 + Math.floor(Math.random() * 30);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低温自燃
    if (temp > 100) {
      world.set(x, y, 6);
      world.setTemp(x, y, 400);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火爆燃
      if ((nid === 6 || nid === 11) && Math.random() < 0.95) {
        world.set(x, y, 6);
        world.setTemp(x, y, 500);
        world.wakeArea(x, y);
        return;
      }

      // 遇水分解
      if (nid === 2 && Math.random() < 0.1) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 遇火花(28)也会燃烧
      if (nid === 28 && Math.random() < 0.9) {
        world.set(x, y, 6);
        world.setTemp(x, y, 450);
        world.wakeArea(x, y);
        return;
      }
    }

    // 气体上升
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

    // 缓慢消散
    if (Math.random() < 0.001) {
      world.set(x, y, 0);
    }
  },
};

registerMaterial(Silane);
