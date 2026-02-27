import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 闪锌矿 —— 含锌硫化物矿石
 * - 固体，高密度，粉末状可下落
 * - 高温(>800°)冶炼产出锡(86)+烟(7)
 * - 遇酸(9)释放毒气(18)
 * - 遇熔岩(11)直接冶炼
 * - 视觉上呈棕黄色带金属光泽
 */

export const Sphalerite: MaterialDef = {
  id: 138,
  name: '闪锌矿',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 棕黄色
      r = 160 + Math.floor(Math.random() * 20);
      g = 120 + Math.floor(Math.random() * 20);
      b = 50 + Math.floor(Math.random() * 15);
    } else if (t < 0.7) {
      // 深棕
      r = 130 + Math.floor(Math.random() * 15);
      g = 95 + Math.floor(Math.random() * 15);
      b = 40 + Math.floor(Math.random() * 10);
    } else {
      // 金属光泽
      r = 180 + Math.floor(Math.random() * 20);
      g = 150 + Math.floor(Math.random() * 15);
      b = 70 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 6.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温冶炼
    if (temp > 800 && Math.random() < 0.05) {
      world.set(x, y, Math.random() < 0.7 ? 86 : 7); // 锡或烟
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸释放毒气
      if (nid === 9 && Math.random() < 0.03) {
        world.set(x, y, 18); // 毒气
        world.wakeArea(x, y);
        return;
      }

      // 遇熔岩冶炼
      if (nid === 11 && Math.random() < 0.08) {
        world.set(x, y, 86); // 锡
        world.wakeArea(x, y);
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
      if (belowDensity < this.density && belowDensity > 0 && Math.random() < 0.3) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 堆积滑落
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

registerMaterial(Sphalerite);
