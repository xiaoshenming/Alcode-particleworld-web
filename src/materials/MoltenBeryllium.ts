import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铍 —— 熔融轻金属
 * - 液体，密度 1.85（极轻液态金属）
 * - 冷却 <1287° → 铍(421)
 * - 接触水产生蒸汽
 * - 灼烧可燃物
 */

export const MoltenBeryllium: MaterialDef = {
  id: 422,
  name: '液态铍',
  category: '熔融金属',
  description: '熔融态的铍，极轻的液态金属，银白色',
  density: 1.85,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 230 + Math.floor(Math.random() * 12);
      g = 235 + Math.floor(Math.random() * 10);
      b = 240 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 210 + Math.floor(Math.random() * 10);
      g = 215 + Math.floor(Math.random() * 10);
      b = 222 + Math.floor(Math.random() * 10);
    } else {
      r = 248 + Math.floor(Math.random() * 7);
      g = 250 + Math.floor(Math.random() * 5);
      b = 252 + Math.floor(Math.random() * 3);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 1287) {
      world.set(x, y, 421);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

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
        world.addTemp(x, y, 15);
        world.wakeArea(nx, ny);
      }

      if ((nid === 4 || nid === 22 || nid === 134) && Math.random() < 0.1) {
        world.set(nx, ny, 6);
        world.wakeArea(nx, ny);
      }

      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        const diff = (temp - nt) * 0.12;
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
      if (bDensity !== Infinity && bDensity < 1.85) {
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

registerMaterial(MoltenBeryllium);
