import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 泥炭 —— 半分解的有机物沉积
 * - 固体/半固体，低密度，可下落
 * - 可燃：遇火(6)缓慢燃烧，产生大量烟(7)
 * - 吸水：遇水(2)膨胀（概率变为沼泽(54)）
 * - 高温干燥后变为木炭(46)
 * - 视觉上呈深棕色
 */

export const Peat: MaterialDef = {
  id: 142,
  name: '泥炭',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 60 + Math.floor(Math.random() * 15);
      g = 35 + Math.floor(Math.random() * 10);
      b = 15 + Math.floor(Math.random() * 10);
    } else if (t < 0.8) {
      r = 50 + Math.floor(Math.random() * 10);
      g = 28 + Math.floor(Math.random() * 10);
      b = 10 + Math.floor(Math.random() * 8);
    } else {
      // 带绿色有机质
      r = 55 + Math.floor(Math.random() * 10);
      g = 40 + Math.floor(Math.random() * 12);
      b = 12 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温干燥变木炭
    if (temp > 300 && Math.random() < 0.03) {
      world.set(x, y, 46); // 木炭
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火燃烧（产生大量烟）
      if (nid === 6 && Math.random() < 0.02) {
        world.set(x, y, Math.random() < 0.3 ? 6 : 7);
        world.wakeArea(x, y);
        return;
      }

      // 吸水变沼泽
      if (nid === 2 && Math.random() < 0.01) {
        world.set(x, y, 54); // 沼泽
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
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
      if (belowDensity < this.density && belowDensity > 0 && Math.random() < 0.2) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
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

registerMaterial(Peat);
