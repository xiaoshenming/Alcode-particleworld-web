import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铜 —— 熔融铜
 * - 液体，高密度
 * - 温度<1085°凝固为铜(85)
 * - 遇水(2)产生蒸汽爆炸
 * - 导热性极好
 * - 视觉上呈明亮橙红色
 */

export const MoltenCopper: MaterialDef = {
  id: 148,
  name: '液态铜',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 240 + Math.floor(Math.random() * 15);
      g = 120 + Math.floor(Math.random() * 30);
      b = 20 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 250;
      g = 100 + Math.floor(Math.random() * 25);
      b = 10 + Math.floor(Math.random() * 10);
    } else {
      // 亮黄
      r = 245 + Math.floor(Math.random() * 10);
      g = 150 + Math.floor(Math.random() * 30);
      b = 30 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 8.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低温凝固
    if (temp < 1085) {
      if (Math.random() < 0.05) {
        world.set(x, y, 85); // 铜
        world.wakeArea(x, y);
        return;
      }
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水蒸汽爆炸
      if (nid === 2 && Math.random() < 0.2) {
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 溅射
        for (const [ex, ey] of dirs) {
          const bx = nx + ex, by = ny + ey;
          if (world.inBounds(bx, by) && world.isEmpty(bx, by)) {
            world.set(bx, by, 8);
            world.markUpdated(bx, by);
            world.wakeArea(bx, by);
          }
        }
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.2) {
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 5) {
          world.addTemp(x, y, -2);
          world.addTemp(nx, ny, 2);
        }
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5) && Math.random() < 0.02) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 散热
    if (Math.random() < 0.02) {
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

      if (Math.random() < 0.3) {
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

registerMaterial(MoltenCopper);
