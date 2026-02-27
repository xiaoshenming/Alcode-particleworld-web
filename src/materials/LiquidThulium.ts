import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态铥 —— 熔融稀土金属
 * - 液体，密度 9.3
 * - 冷却 <1510° → 铥(391)
 * - 接触水(2)产生蒸汽并升温
 * - 高温灼烧周围
 */

export const LiquidThulium: MaterialDef = {
  id: 392,
  name: '液态铥',
  category: '熔融金属',
  description: '熔融态的铥，银蓝色液态金属',
  density: 9.3,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 亮银蓝
      r = 220 + Math.floor(Math.random() * 15);
      g = 210 + Math.floor(Math.random() * 20);
      b = 245 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 暗蓝银
      r = 195 + Math.floor(Math.random() * 15);
      g = 185 + Math.floor(Math.random() * 18);
      b = 220 + Math.floor(Math.random() * 15);
    } else {
      // 亮白高光
      r = 240 + Math.floor(Math.random() * 12);
      g = 235 + Math.floor(Math.random() * 12);
      b = 250 + Math.floor(Math.random() * 5);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 1510) {
      world.set(x, y, 391); // 铥
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 自然降温
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 灼烧周围 & 接触水产生蒸汽
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 && Math.random() < 0.12) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, 15);
        world.wakeArea(nx, ny);
      }

      if ((nid === 4 || nid === 22 || nid === 134) && Math.random() < 0.08) {
        world.set(nx, ny, 6); // 火
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
      if (bDensity !== Infinity && bDensity < 9.3) {
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

registerMaterial(LiquidThulium);
