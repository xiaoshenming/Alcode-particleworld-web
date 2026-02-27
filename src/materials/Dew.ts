import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 露水 —— 清晨凝结的水珠
 * - 液体，极低密度（比水轻）
 * - 温度升高(>30°)蒸发为蒸汽(8)
 * - 遇植物(13)/苔藓(49)/藤蔓(57)被吸收促进生长
 * - 遇冰(14)/雪(15)冻结为霜(75)
 * - 遇火(6)立即蒸发
 * - 视觉上呈透明水珠带微光
 */

export const Dew: MaterialDef = {
  id: 130,
  name: '露水',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 透明水蓝
      r = 180 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 20);
      b = 235 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 晶莹白
      r = 210 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 15);
      b = 240 + Math.floor(Math.random() * 10);
    } else {
      // 微绿透明
      r = 185 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 15);
      b = 220 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 温度升高蒸发
    if (temp > 30 && Math.random() < 0.08) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    // 低温冻结为霜
    if (temp < -5 && Math.random() < 0.1) {
      world.set(x, y, 75); // 霜
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火蒸发
      if (nid === 6 && Math.random() < 0.3) {
        world.set(x, y, 8); // 蒸汽
        world.wakeArea(x, y);
        return;
      }

      // 被植物/苔藓/藤蔓吸收
      if ((nid === 13 || nid === 49 || nid === 57) && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇冰/雪冻结为霜
      if ((nid === 14 || nid === 15) && Math.random() < 0.08) {
        world.set(x, y, 75); // 霜
        world.wakeArea(x, y);
        return;
      }
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

      // 水平扩散
      if (Math.random() < 0.5) {
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

registerMaterial(Dew);
