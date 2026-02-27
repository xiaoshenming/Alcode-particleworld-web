import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态镍 —— 银白色高温液态金属
 * - 液体，密度 7.2
 * - 温度<1455° 凝固为镍(216)
 * - 接触水产生蒸汽
 * - 点燃可燃物
 */

export const MoltenNickel: MaterialDef = {
  id: 217,
  name: '液态镍',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 橙白色高温
      r = 240 + Math.floor(Math.random() * 15);
      g = 170 + Math.floor(Math.random() * 45);
      b = 90 + Math.floor(Math.random() * 40);
    } else {
      // 亮黄白色
      r = 248 + Math.floor(Math.random() * 7);
      g = 210 + Math.floor(Math.random() * 35);
      b = 140 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 7.2,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    world.setTemp(x, y, Math.max(temp, 1500));
    world.wakeArea(x, y);
    world.set(x, y, 217);

    // 冷却凝固
    if (temp < 1455) {
      world.set(x, y, 216);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2) {
        world.set(nx, ny, 8);
        world.addTemp(nx, ny, 180);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      if ((nid === 4 || nid === 5 || nid === 13) && Math.random() < 0.12) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }
    }

    // 散热
    if (Math.random() < 0.02) {
      world.addTemp(x, y, -14);
    }

    // === 液体流动 ===
    if (y >= world.height - 1) return;

    if (Math.random() < 0.5) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }

    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 7.2 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(MoltenNickel);
