import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 十字石片岩 —— 含十字石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1350° → 熔岩(11)
 * - 耐酸腐蚀
 * - 棕褐色带十字石晶体
 */

export const StauroliteSchist: MaterialDef = {
  id: 529,
  name: '十字石片岩',
  category: '固体',
  description: '含十字石矿物的变质岩，指示中压中温变质条件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 128 + Math.floor(Math.random() * 12);
      g = 95 + Math.floor(Math.random() * 10);
      b = 68 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 148 + Math.floor(Math.random() * 12);
      g = 112 + Math.floor(Math.random() * 10);
      b = 82 + Math.floor(Math.random() * 10);
    } else {
      r = 108 + Math.floor(Math.random() * 8);
      g = 78 + Math.floor(Math.random() * 8);
      b = 55 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1350) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.002) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(StauroliteSchist);
