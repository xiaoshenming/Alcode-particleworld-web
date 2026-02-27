import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铪合金 —— 熔融状态的铪合金
 * - 液体，密度 6.8（极重）
 * - 冷却到 2500° 以下凝固为铪合金(291)
 * - 极高温发光：白橙色多相
 * - 接触水产生蒸汽
 */

export const MoltenHafniumAlloy: MaterialDef = {
  id: 292,
  name: '液态铪合金',
  category: '熔融金属',
  description: '熔融状态的铪合金，极高温液态金属',
  density: 6.8,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.45) {
      // 亮白橙
      r = 252 + Math.floor(Math.random() * 3);
      g = 225 + Math.floor(Math.random() * 20);
      b = 175 + Math.floor(Math.random() * 30);
    } else if (phase < 0.75) {
      // 橙黄
      r = 255;
      g = 210 + Math.floor(Math.random() * 25);
      b = 140 + Math.floor(Math.random() * 35);
    } else {
      // 白热
      r = 250 + Math.floor(Math.random() * 5);
      g = 242 + Math.floor(Math.random() * 10);
      b = 220 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 散热
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    // 凝固：温度低于 2500 → 铪合金(291)
    if (temp < 2500) {
      world.set(x, y, 291);
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
    // 先下落
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0 || (world.getDensity(x, y + 1) < 6.8 && below !== 291)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下
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

    // 水平流动
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

registerMaterial(MoltenHafniumAlloy);
