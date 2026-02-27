import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态银 —— 熔融状态的银
 * - 液体，密度 5.0
 * - 冷却到 962° 以下凝固为银(246)
 * - 高温发光：白亮色熔融金属
 * - 接触水产生蒸汽
 */

export const MoltenSilver: MaterialDef = {
  id: 247,
  name: '液态银',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 白亮色
      r = 245 + Math.floor(Math.random() * 10);
      g = 230 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 30);
    } else if (phase < 0.8) {
      // 亮黄白
      r = 250 + Math.floor(Math.random() * 5);
      g = 240 + Math.floor(Math.random() * 15);
      b = 180 + Math.floor(Math.random() * 30);
    } else {
      // 橙白
      r = 240 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 25);
      b = 140 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 5.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 散热
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 凝固
    if (temp < 962) {
      world.set(x, y, 246);
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
      if (nid === 2 && Math.random() < 0.2) {
        world.set(nx, ny, 8);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 加热邻居
      if (nid !== 0) {
        world.addTemp(nx, ny, 10);
      }
    }

    // === 液体流动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0 || (world.getDensity(x, y + 1) < 5.0 && below !== 246)) {
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

registerMaterial(MoltenSilver);
