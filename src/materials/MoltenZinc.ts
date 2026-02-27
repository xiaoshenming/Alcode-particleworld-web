import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态锌 —— 蓝白色低温液态金属
 * - 液体，密度 5.8
 * - 温度<419° 凝固为锌(221)
 * - 接触水产生蒸汽
 * - 熔点较低，容易凝固
 */

export const MoltenZinc: MaterialDef = {
  id: 222,
  name: '液态锌',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 银蓝色
      r = 190 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 30);
      b = 220 + Math.floor(Math.random() * 25);
    } else {
      // 亮银色
      r = 210 + Math.floor(Math.random() * 30);
      g = 215 + Math.floor(Math.random() * 25);
      b = 230 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 5.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    world.setTemp(x, y, Math.max(temp, 450));
    world.wakeArea(x, y);
    world.set(x, y, 222);

    // 冷却凝固
    if (temp < 419) {
      world.set(x, y, 221);
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
        world.addTemp(nx, ny, 80);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      if ((nid === 4 || nid === 5 || nid === 13) && Math.random() < 0.08) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }
    }

    // 快速散热（低熔点金属）
    if (Math.random() < 0.04) {
      world.addTemp(x, y, -10);
    }

    // === 液体流动 ===
    if (y >= world.height - 1) return;

    if (Math.random() < 0.55) {
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

    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 5.8 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(MoltenZinc);
