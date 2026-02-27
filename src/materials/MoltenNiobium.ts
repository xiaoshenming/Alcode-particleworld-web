import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铌 —— 熔融状态的铌
 * - 液体，密度 4.3
 * - 冷却到 2477° 以下凝固为铌(276)
 * - 高温发光：蓝白色
 * - 接触水产生蒸汽
 */

export const MoltenNiobium: MaterialDef = {
  id: 277,
  name: '液态铌',
  category: '熔融金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 蓝白亮
      r = 230 + Math.floor(Math.random() * 20);
      g = 235 + Math.floor(Math.random() * 15);
      b = 255;
    } else if (phase < 0.8) {
      // 亮白蓝
      r = 240 + Math.floor(Math.random() * 10);
      g = 245 + Math.floor(Math.random() * 10);
      b = 255;
    } else {
      // 橙白
      r = 255;
      g = 230 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.3,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 散热
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 凝固
    if (temp < 2477) {
      world.set(x, y, 276);
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

      // 接触水 → 蒸汽
      if (nid === 2 && Math.random() < 0.3) {
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
      if (below === 0 || (world.getDensity(x, y + 1) < 4.3 && below !== 276)) {
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

registerMaterial(MoltenNiobium);
