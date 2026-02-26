import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钍 —— 熔融放射性金属
 * - 液体，密度 11.7
 * - 冷却 <1750° → 钍(416)
 * - 自发热（放射性）
 * - 接触水产生蒸汽
 * - 高温灼烧可燃物
 */

export const MoltenThorium: MaterialDef = {
  id: 417,
  name: '液态钍',
  category: '熔融金属',
  description: '熔融态的钍，银白色液态金属，具有放射性自发热',
  density: 11.7,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 235 + Math.floor(Math.random() * 12);
      g = 228 + Math.floor(Math.random() * 12);
      b = 215 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 215 + Math.floor(Math.random() * 10);
      g = 208 + Math.floor(Math.random() * 10);
      b = 198 + Math.floor(Math.random() * 10);
    } else {
      r = 250 + Math.floor(Math.random() * 5);
      g = 245 + Math.floor(Math.random() * 6);
      b = 235 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 1750) {
      world.set(x, y, 416);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 放射性自发热
    if (Math.random() < 0.2) {
      world.addTemp(x, y, 1);
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
      if (bDensity !== Infinity && bDensity < 11.7) {
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

registerMaterial(MoltenThorium);
