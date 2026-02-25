import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铝 —— 熔融铝
 * - 液体，中高密度
 * - 温度<660°凝固为金属(10)
 * - 遇水(2)产生氢气(19)+蒸汽(8)爆炸
 * - 遇铁锈(72)发生铝热反应（极高温）
 * - 视觉上呈银白色液体
 */

export const MoltenAluminum: MaterialDef = {
  id: 153,
  name: '液态铝',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 210 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 20);
      b = 220 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 225 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 15);
      b = 210 + Math.floor(Math.random() * 15);
    } else {
      r = 240 + Math.floor(Math.random() * 10);
      g = 235 + Math.floor(Math.random() * 10);
      b = 225 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低温凝固
    if (temp < 660 && Math.random() < 0.04) {
      world.set(x, y, 10); // 金属
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水爆炸产生氢气
      if (nid === 2 && Math.random() < 0.15) {
        world.set(nx, ny, Math.random() < 0.5 ? 19 : 8); // 氢气或蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 遇铁锈铝热反应
      if (nid === 72 && Math.random() < 0.05) {
        world.set(nx, ny, 113); // 熔融金属
        world.addTemp(x, y, 200);
        world.addTemp(nx, ny, 500);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.15) {
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 5) {
          world.addTemp(x, y, -2);
          world.addTemp(nx, ny, 2);
        }
      }
    }

    // 散热
    if (Math.random() < 0.02) {
      world.addTemp(x, y, -1);
    }

    // 液体流动
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < this.density && belowDensity > 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }

      if (Math.random() < 0.3) {
        for (const d of [dir, -dir]) {
          const sx = x + d;
          if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
            world.swap(x, y, sx, y);
            world.markUpdated(sx, y);
            world.wakeArea(sx, y);
            return;
          }
        }
      }
    }
  },
};

registerMaterial(MoltenAluminum);
