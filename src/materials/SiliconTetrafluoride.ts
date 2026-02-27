import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 四氟化硅 —— 有毒腐蚀性气体
 * - 气体，密度 -0.15（较重气体，上升慢）
 * - 接触水(2) → 分解为酸液(9)+烟(7)
 * - 腐蚀玻璃(17) → 变为空气
 * - 高温(>400°) → 分解为烟(7)
 * - 无色微带白雾
 */

export const SiliconTetrafluoride: MaterialDef = {
  id: 333,
  name: '四氟化硅',
  category: '气体',
  description: '有毒腐蚀性气体，可腐蚀玻璃',
  density: -0.15,
  color() {
    const r = 200 + Math.floor(Math.random() * 30);
    const g = 205 + Math.floor(Math.random() * 30);
    const b = 210 + Math.floor(Math.random() * 30);
    const a = 35 + Math.floor(Math.random() * 25);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 400) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水分解为酸
      if (nid === 2 && Math.random() < 0.15) {
        world.set(x, y, 9); // 酸液
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀玻璃
      if (nid === 17 && Math.random() < 0.05) {
        world.set(nx, ny, 0);
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }
    }

    // 气体上升（较慢）
    if (y <= 0) return;
    if (world.isEmpty(x, y - 1) && Math.random() < 0.4) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上
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
    if (Math.random() < 0.0008) {
      world.set(x, y, 0);
    }
  },
};

registerMaterial(SiliconTetrafluoride);
