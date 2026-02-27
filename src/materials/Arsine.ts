import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 砷化氢 —— 剧毒无色气体，微带蒜味
 * - 气体，密度 -0.5（上升）
 * - 剧毒：接触水(2) → 污染为毒液(19)
 * - 可燃：接触火(6)/熔岩(11) → 爆炸为火(6)+烟(7)
 * - 高温(>300°) → 分解为烟(7)
 * - 接触金属(10)表面沉积
 * - 几乎无色，微带淡黄绿
 */

export const Arsine: MaterialDef = {
  id: 313,
  name: '砷化氢',
  category: '气体',
  description: '剧毒可燃气体，微带蒜味',
  density: -0.5,
  color() {
    const r = 180 + Math.floor(Math.random() * 30);
    const g = 195 + Math.floor(Math.random() * 30);
    const b = 170 + Math.floor(Math.random() * 25);
    const a = 80 + Math.floor(Math.random() * 40);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 300) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 可燃：遇火爆炸
      if ((nid === 6 || nid === 11) && Math.random() < 0.8) {
        world.set(x, y, 6);
        world.setTemp(x, y, 400);
        world.wakeArea(x, y);
        return;
      }

      // 剧毒：污染水
      if (nid === 2 && Math.random() < 0.06) {
        world.set(nx, ny, 19);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 气体上升
    if (y <= 0) return;
    if (world.isEmpty(x, y - 1)) {
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
    const spread = 2 + Math.floor(Math.random() * 2);
    for (let d = 1; d <= spread; d++) {
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

registerMaterial(Arsine);
