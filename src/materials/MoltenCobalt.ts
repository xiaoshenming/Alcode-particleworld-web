import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钴 —— 熔融状态的钴
 * - 液体，密度 4.5
 * - 冷却到 1495° 以下凝固为钴(231)
 * - 高温发光：橙红色熔融金属
 * - 接触水产生蒸汽爆炸
 */

export const MoltenCobalt: MaterialDef = {
  id: 232,
  name: '液态钴',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 橙红色
      r = 230 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 40);
      b = 30 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 亮黄橙
      r = 245 + Math.floor(Math.random() * 10);
      g = 160 + Math.floor(Math.random() * 40);
      b = 40 + Math.floor(Math.random() * 30);
    } else {
      // 暗红
      r = 200 + Math.floor(Math.random() * 30);
      g = 80 + Math.floor(Math.random() * 30);
      b = 20 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 自然散热
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 凝固
    if (temp < 1495) {
      world.set(x, y, 231); // 钴
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
      if (nid === 2 && Math.random() < 0.3) {
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 加热邻居
      if (nid !== 0) {
        world.addTemp(nx, ny, 15);
      }
    }

    // === 液体流动 ===
    // 重力下落
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0 || (world.getDensity(x, y + 1) < 4.5 && below !== 231)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 侧流
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

registerMaterial(MoltenCobalt);
