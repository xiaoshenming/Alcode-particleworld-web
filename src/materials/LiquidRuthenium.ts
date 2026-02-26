import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钌 —— 熔融铂族金属
 * - 液体，密度 12.4
 * - 冷却 <2300° → 钌(406)
 * - 接触水产生蒸汽
 * - 高温灼烧周围可燃物
 */

export const LiquidRuthenium: MaterialDef = {
  id: 407,
  name: '液态钌',
  category: '熔融金属',
  description: '熔融态的钌，银白色液态金属，温度极高',
  density: 12.4,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 230 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 15);
      b = 220 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 210 + Math.floor(Math.random() * 12);
      g = 205 + Math.floor(Math.random() * 12);
      b = 200 + Math.floor(Math.random() * 12);
    } else {
      r = 248 + Math.floor(Math.random() * 7);
      g = 245 + Math.floor(Math.random() * 8);
      b = 242 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 2300) {
      world.set(x, y, 406);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 自然降温
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 && Math.random() < 0.15) {
        world.set(nx, ny, 8);
        world.addTemp(x, y, 20);
        world.wakeArea(nx, ny);
      }

      if ((nid === 4 || nid === 22 || nid === 134) && Math.random() < 0.1) {
        world.set(nx, ny, 6);
        world.wakeArea(nx, ny);
      }

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
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 12.4) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
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

registerMaterial(LiquidRuthenium);
