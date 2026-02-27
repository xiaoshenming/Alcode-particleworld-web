import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铪铼 —— 熔融超高温合金
 * - 液体，密度 14.5
 * - 冷却 <3200° → 铪铼合金(411)
 * - 接触水产生蒸汽爆炸
 * - 高温灼烧周围可燃物
 */

export const MoltenHafniumRhenium: MaterialDef = {
  id: 412,
  name: '液态铪铼',
  category: '熔融金属',
  description: '熔融态的铪铼合金，温度极高的银蓝色液态金属',
  density: 14.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 235 + Math.floor(Math.random() * 12);
      g = 228 + Math.floor(Math.random() * 12);
      b = 240 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 215 + Math.floor(Math.random() * 10);
      g = 210 + Math.floor(Math.random() * 10);
      b = 225 + Math.floor(Math.random() * 10);
    } else {
      r = 250 + Math.floor(Math.random() * 5);
      g = 245 + Math.floor(Math.random() * 8);
      b = 252 + Math.floor(Math.random() * 3);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 3200) {
      world.set(x, y, 411);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 自然降温
    if (temp > 20) {
      world.addTemp(x, y, -3);
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水产生蒸汽
      if (nid === 2 && Math.random() < 0.2) {
        world.set(nx, ny, 8);
        world.addTemp(x, y, 25);
        world.wakeArea(nx, ny);
      }

      // 灼烧可燃物
      if ((nid === 4 || nid === 22 || nid === 134) && Math.random() < 0.12) {
        world.set(nx, ny, 6);
        world.wakeArea(nx, ny);
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.1) {
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
      if (bDensity !== Infinity && bDensity < 14.5) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    if (Math.random() < 0.35) {
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

registerMaterial(MoltenHafniumRhenium);
