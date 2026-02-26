import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态镱 —— 熔融稀土金属
 * - 液体，密度 6.9
 * - 冷却 <800° → 镱(381)
 * - 接触水(2)产生蒸汽(8)
 */

export const LiquidYtterbium: MaterialDef = {
  id: 382,
  name: '液态镱',
  category: '熔融金属',
  description: '熔融态的镱，银白色液态金属',
  density: 6.9,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 亮橙白
      r = 230 + Math.floor(Math.random() * 20);
      g = 175 + Math.floor(Math.random() * 25);
      b = 135 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗橙
      r = 205 + Math.floor(Math.random() * 18);
      g = 150 + Math.floor(Math.random() * 20);
      b = 110 + Math.floor(Math.random() * 15);
    } else {
      // 亮白高光
      r = 240 + Math.floor(Math.random() * 15);
      g = 205 + Math.floor(Math.random() * 20);
      b = 170 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 800) {
      world.set(x, y, 381);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 自然降温
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 接触周围的交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水产生蒸汽
      if (nid === 2 && Math.random() < 0.12) {
        world.set(nx, ny, 8); // 蒸汽
        world.wakeArea(nx, ny);
      }

      // 灼烧可燃物
      if ((nid === 4 || nid === 22 || nid === 134) && Math.random() < 0.08) {
        world.set(nx, ny, 6); // 火
        world.wakeArea(nx, ny);
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        const diff = (temp - nt) * 0.15;
        if (diff > 1) {
          world.addTemp(nx, ny, diff);
          world.addTemp(x, y, -diff * 0.5);
        }
      }
    }

    // === 液体运动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      if (below !== 0) {
        const bDensity = world.getDensity(x, y + 1);
        if (bDensity !== Infinity && bDensity < 6.9) {
          world.swap(x, y, x, y + 1);
          world.markUpdated(x, y + 1);
          return;
        }
      }
    }

    if (Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    if (y < world.height - 1) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(LiquidYtterbium);
