import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态钽 —— 熔融状态的钽
 * - 液体，密度 8.5
 * - 冷却到 3017° 以下凝固为钽(296)
 * - 接触水产生蒸汽
 * - 白橙色高温发光
 */

export const MoltenTantalum: MaterialDef = {
  id: 297,
  name: '液态钽',
  category: '熔融金属',
  description: '熔融状态的钽，极高温液态金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.45) {
      // 亮白橙
      r = 255;
      g = 230 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 30);
    } else if (phase < 0.75) {
      // 橙黄
      r = 255;
      g = 215 + Math.floor(Math.random() * 25);
      b = 165 + Math.floor(Math.random() * 30);
    } else {
      // 白热
      r = 255;
      g = 245 + Math.floor(Math.random() * 10);
      b = 225 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 8.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 散热
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 凝固
    if (temp < 3017) {
      world.set(x, y, 296);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

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
        world.addTemp(nx, ny, 22);
      }
    }

    // === 液体流动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0 || (world.getDensity(x, y + 1) < 8.5 && below !== 296)) {
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

registerMaterial(MoltenTantalum);
