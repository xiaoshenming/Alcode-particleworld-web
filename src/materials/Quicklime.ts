import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 石灰 —— 氧化钙粉末
 * - 粉末，受重力下落
 * - 遇水(2)剧烈放热反应，产生蒸汽(8)，变为湿水泥(35)
 * - 遇酸液(9)中和反应，产生盐(23)
 * - 高温(>2500)熔化为熔岩(11)
 * - 可用于建筑（堆积后稳定）
 * - 视觉上呈白色粉末
 */

export const Quickite: MaterialDef = {
  id: 124,
  name: '石灰',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 白色
      r = 235 + Math.floor(Math.random() * 15);
      g = 230 + Math.floor(Math.random() * 15);
      b = 220 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 灰白色
      r = 220 + Math.floor(Math.random() * 15);
      g = 215 + Math.floor(Math.random() * 15);
      b = 205 + Math.floor(Math.random() * 15);
    } else {
      // 微黄白
      r = 230 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 10);
      b = 200 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 2500) {
      world.set(x, y, 11); // 熔岩
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈放热
      if (nid === 2 && Math.random() < 0.1) {
        world.set(nx, ny, 8); // 蒸汽
        world.set(x, y, 35); // 湿水泥
        world.addTemp(x, y, 50);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇酸液中和
      if (nid === 9 && Math.random() < 0.08) {
        world.set(nx, ny, 0); // 酸液消耗
        world.set(x, y, 23); // 盐
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇熔岩加热
      if (nid === 11) {
        world.addTemp(x, y, 10);
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
      if (belowDensity < this.density && belowDensity > 0) {
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

    // 自然散热
    if (temp > 20 && Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Quickite);
