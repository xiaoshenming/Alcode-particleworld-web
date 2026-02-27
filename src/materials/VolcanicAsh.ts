import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 火山灰 —— 火山喷发的细颗粒
 * - 粉末，低密度，可下落
 * - 受风力影响飘散
 * - 遇水(2)变为湿水泥(35)
 * - 高温(>600°)烧结为玻璃(17)
 * - 覆盖植物(13)/种子(12)使其窒息死亡
 * - 视觉上呈灰色带褐色
 */

export const VolcanicAsh: MaterialDef = {
  id: 144,
  name: '火山灰',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 95 + Math.floor(Math.random() * 15);
      g = 85 + Math.floor(Math.random() * 15);
      b = 75 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 80 + Math.floor(Math.random() * 10);
      g = 72 + Math.floor(Math.random() * 10);
      b = 65 + Math.floor(Math.random() * 10);
    } else {
      // 褐色
      r = 105 + Math.floor(Math.random() * 15);
      g = 88 + Math.floor(Math.random() * 10);
      b = 70 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.2,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温烧结为玻璃
    if (temp > 600 && Math.random() < 0.02) {
      world.set(x, y, 17); // 玻璃
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水变湿水泥
      if (nid === 2 && Math.random() < 0.02) {
        world.set(x, y, 35); // 湿水泥
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 窒息植物
      if ((nid === 13 || nid === 12) && Math.random() < 0.005) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 受风力影响
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    if (wind !== 0 && Math.random() < windStr * 0.3) {
      const wx = x + wind;
      if (world.inBounds(wx, y) && world.isEmpty(wx, y)) {
        world.swap(x, y, wx, y);
        world.markUpdated(wx, y);
        world.wakeArea(wx, y);
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

registerMaterial(VolcanicAsh);
