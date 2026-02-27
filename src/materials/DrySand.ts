import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 干沙 —— 极度干燥的细沙
 * - 粉末，中等密度，流动性比普通沙更好
 * - 遇水(2)变为普通沙(1)
 * - 受风力影响容易飘散
 * - 高温(>1700°)熔化为液态玻璃(92)
 * - 视觉上呈浅黄白色
 */

export const DrySand: MaterialDef = {
  id: 146,
  name: '干沙',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 225 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 170 + Math.floor(Math.random() * 20);
    } else if (t < 0.8) {
      r = 235 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 15);
      b = 185 + Math.floor(Math.random() * 15);
    } else {
      r = 215 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 15);
      b = 160 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1700 && Math.random() < 0.03) {
      world.set(x, y, 92); // 液态玻璃
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水变普通沙
      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 1);
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }

    // 受风力影响
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    if (wind !== 0 && Math.random() < windStr * 0.2) {
      const wx = x + wind;
      if (world.inBounds(wx, y) && world.isEmpty(wx, y)) {
        world.swap(x, y, wx, y);
        world.markUpdated(wx, y);
        world.wakeArea(wx, y);
        return;
      }
    }

    // 粉末下落（流动性更好）
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0 && Math.random() < 0.4) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
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

registerMaterial(DrySand);
