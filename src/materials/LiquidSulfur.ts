import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态硫 —— 熔融硫磺
 * - 液体，中等密度
 * - 温度降到<115°凝固为硫磺(66)
 * - 极易燃：遇火(6)/火花(28)点燃产生毒气(18)+烟(7)
 * - 遇水(2)冷却凝固
 * - 遇金属(10)腐蚀
 * - 视觉上呈明亮黄色液体
 */

export const LiquidSulfur: MaterialDef = {
  id: 135,
  name: '液态硫',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 明亮黄色
      r = 230 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 25);
      b = 20 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 深黄色
      r = 215 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 20);
      b = 15 + Math.floor(Math.random() * 10);
    } else {
      // 橙黄色
      r = 240 + Math.floor(Math.random() * 10);
      g = 190 + Math.floor(Math.random() * 20);
      b = 30 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低温凝固为硫磺
    if (temp < 115) {
      world.set(x, y, 66); // 硫磺
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火点燃
      if ((nid === 6 || nid === 28) && Math.random() < 0.15) {
        world.set(x, y, Math.random() < 0.5 ? 18 : 7); // 毒气或烟
        world.wakeArea(x, y);
        return;
      }

      // 遇水冷却
      if (nid === 2 && Math.random() < 0.1) {
        world.addTemp(x, y, -20);
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 腐蚀金属
      if (nid === 10 && Math.random() < 0.01) {
        world.set(nx, ny, 72); // 铁锈
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 缓慢散热
    if (Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }

    // 液体流动
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0) {
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

      if (Math.random() < 0.4) {
        for (const d of [dir, -dir]) {
          const sx = x + d;
          if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
            world.swap(x, y, sx, y);
            world.markUpdated(sx, y);
            world.wakeArea(sx, y);
            return;
          }
        }
      }
    }
  },
};

registerMaterial(LiquidSulfur);
