import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铪 —— 熔融状态的铪
 * - 液体，密度 6.8（极重）
 * - 冷却到 2233° 以下凝固为铪(261)
 * - 高温发光：橙白色
 * - 接触水产生蒸汽爆炸
 */

export const MoltenHafnium: MaterialDef = {
  id: 262,
  name: '液态铪',
  category: '熔融金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 橙白亮
      r = 250 + Math.floor(Math.random() * 5);
      g = 220 + Math.floor(Math.random() * 25);
      b = 180 + Math.floor(Math.random() * 30);
    } else if (phase < 0.8) {
      // 亮白
      r = 248 + Math.floor(Math.random() * 7);
      g = 240 + Math.floor(Math.random() * 10);
      b = 210 + Math.floor(Math.random() * 20);
    } else {
      // 橙红
      r = 255;
      g = 200 + Math.floor(Math.random() * 30);
      b = 150 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 6.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 散热
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 凝固
    if (temp < 2233) {
      world.set(x, y, 261);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水 → 蒸汽爆炸
      if (nid === 2 && Math.random() < 0.35) {
        world.set(nx, ny, 8);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 加热邻居
      if (nid !== 0) {
        world.addTemp(nx, ny, 20);
      }
    }

    // === 液体流动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0 || (world.getDensity(x, y + 1) < 6.8 && below !== 261)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
        do {
      const d = dir;
      const nx = x + d;
      if (!world.inBounds(nx, y)) break;
      if (y < world.height - 1 && world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    } while (false);
    do {
      const d = -dir;
      const nx = x + d;
      if (!world.inBounds(nx, y)) break;
      if (y < world.height - 1 && world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    } while (false);

        {
      const d = dir;
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }
  },
};

registerMaterial(MoltenHafnium);
