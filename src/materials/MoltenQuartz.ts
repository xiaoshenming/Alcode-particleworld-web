import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 熔融石英 —— 高温熔化的二氧化硅
 * - 液体，高密度，流动缓慢
 * - 温度<1700°凝固为石英(98)
 * - 极高粘度：流动速度很慢
 * - 遇水(2)急冷产生玻璃(17)
 * - 视觉上呈橙红色发光液体
 */

export const MoltenQuartz: MaterialDef = {
  id: 157,
  name: '熔融石英',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 240 + Math.floor(Math.random() * 15);
      g = 140 + Math.floor(Math.random() * 30);
      b = 40 + Math.floor(Math.random() * 20);
    } else if (t < 0.8) {
      r = 250;
      g = 120 + Math.floor(Math.random() * 25);
      b = 30 + Math.floor(Math.random() * 15);
    } else {
      r = 235 + Math.floor(Math.random() * 15);
      g = 160 + Math.floor(Math.random() * 25);
      b = 55 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低温凝固
    if (temp < 1700 && Math.random() < 0.03) {
      world.set(x, y, 98); // 石英
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水急冷为玻璃
      if (nid === 2 && Math.random() < 0.1) {
        world.set(x, y, 17); // 玻璃
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5) && Math.random() < 0.02) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.1) {
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 10) {
          world.addTemp(x, y, -2);
          world.addTemp(nx, ny, 2);
        }
      }
    }

    // 散热
    if (Math.random() < 0.02) {
      world.addTemp(x, y, -1);
    }

    // 高粘度液体流动（慢速）
    if (Math.random() < 0.3 && world.inBounds(x, y + 1)) {
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

      if (Math.random() < 0.15) {
                {
          const d = dir;
          const sx = x + d;
          if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
            world.swap(x, y, sx, y);
            world.markUpdated(sx, y);
            world.wakeArea(sx, y);
            return;
          }
        }
        {
          const d = -dir;
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

registerMaterial(MoltenQuartz);
