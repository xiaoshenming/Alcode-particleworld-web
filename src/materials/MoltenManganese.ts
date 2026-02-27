import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态锰 —— 银白色高温液态金属
 * - 液体，密度 6.0
 * - 温度<1246° 凝固为锰(211)
 * - 接触水产生蒸汽
 * - 点燃可燃物
 */

export const MoltenManganese: MaterialDef = {
  id: 212,
  name: '液态锰',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 橙红色高温
      r = 235 + Math.floor(Math.random() * 20);
      g = 150 + Math.floor(Math.random() * 50);
      b = 80 + Math.floor(Math.random() * 40);
    } else {
      // 亮橙色
      r = 245 + Math.floor(Math.random() * 10);
      g = 190 + Math.floor(Math.random() * 40);
      b = 120 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 6.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    world.setTemp(x, y, Math.max(temp, 1300));
    world.wakeArea(x, y);
    world.set(x, y, 212); // 刷新颜色

    // 冷却凝固
    if (temp < 1246) {
      world.set(x, y, 211);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水产生蒸汽
      if (nid === 2) {
        world.set(nx, ny, 8);
        world.addTemp(nx, ny, 150);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5 || nid === 13) && Math.random() < 0.12) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }
    }

    // 散热
    if (Math.random() < 0.02) {
      world.addTemp(x, y, -12);
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
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }

    // 水平流动
    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 6.0 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(MoltenManganese);
