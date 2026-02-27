import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 石英砂 —— 白色偏黄的细沙
 * - 粉末，密度 2.8，可下落堆积
 * - 高温(>1700°)熔化为熔融石英(157)
 * - 遇雷电(16)/电弧(145)变为闪电沙(170)
 */

/** 电源材质 */
const ELECTRIC = new Set([16, 145]); // 雷电、电弧

export const QuartzSand: MaterialDef = {
  id: 184,
  name: '石英砂',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 白色偏黄
      r = 230 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 20);
    } else if (t < 0.8) {
      // 浅米色
      r = 240 + Math.floor(Math.random() * 15);
      g = 230 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 15);
    } else {
      // 略暗的黄白
      r = 215 + Math.floor(Math.random() * 15);
      g = 205 + Math.floor(Math.random() * 15);
      b = 175 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为熔融石英
    if (temp > 1700 && Math.random() < 0.03) {
      world.set(x, y, 157); // 熔融石英
      world.setTemp(x, y, 1700);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇雷电/电弧变为闪电沙
      if (ELECTRIC.has(nid) && Math.random() < 0.3) {
        world.set(x, y, 170); // 闪电沙
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
      // 密度置换（沉入轻液体）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < this.density && Math.random() < 0.4) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下堆积
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

registerMaterial(QuartzSand);
