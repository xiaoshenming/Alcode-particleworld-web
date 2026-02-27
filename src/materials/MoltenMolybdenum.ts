import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钼 —— 熔融状态的钼
 * - 液体，密度 5.3（极重）
 * - 冷却到 2623° 以下凝固为钼(256)
 * - 高温发光：白蓝色
 * - 接触水产生蒸汽爆炸
 */

export const MoltenMolybdenum: MaterialDef = {
  id: 257,
  name: '液态钼',
  category: '熔融金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 白蓝亮
      r = 230 + Math.floor(Math.random() * 20);
      g = 235 + Math.floor(Math.random() * 20);
      b = 250 + Math.floor(Math.random() * 5);
    } else if (phase < 0.8) {
      // 亮白
      r = 245 + Math.floor(Math.random() * 10);
      g = 248 + Math.floor(Math.random() * 7);
      b = 255;
    } else {
      // 蓝白
      r = 210 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 20);
      b = 245 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 5.3,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 散热
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 凝固
    if (temp < 2623) {
      world.set(x, y, 256);
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
        world.addTemp(nx, ny, 25);
      }
    }

    // === 液体流动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0 || (world.getDensity(x, y + 1) < 5.3 && below !== 256)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (!world.inBounds(nx, y)) continue;
      if (y < world.height - 1 && world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }
  },
};

registerMaterial(MoltenMolybdenum);
