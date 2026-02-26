import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铈 —— 最丰富的稀土金属，打火石的关键成分
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>795° → 液态铈(357)
 * - 摩擦生火：接触石(3)时有概率产生火花(6)
 * - 耐酸(9)较弱（活泼稀土）
 * - 银灰色带微金属光泽
 */

export const Cerium: MaterialDef = {
  id: 356,
  name: '铈',
  category: '金属',
  description: '最丰富的稀土金属，打火石的关键成分，摩擦可产生火花',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 185 + Math.floor(Math.random() * 15);
      g = 182 + Math.floor(Math.random() * 15);
      b = 175 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      const base = 160 + Math.floor(Math.random() * 15);
      r = base + 4;
      g = base + 2;
      b = base;
    } else {
      r = 200 + Math.floor(Math.random() * 18);
      g = 195 + Math.floor(Math.random() * 15);
      b = 185 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 795) {
      world.set(x, y, 357);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触石头产生火花
      if (nid === 3 && Math.random() < 0.02) {
        // 在空位生成火
        for (const [dx2, dy2] of dirs) {
          const fx = x + dx2, fy = y + dy2;
          if (world.inBounds(fx, fy) && world.isEmpty(fx, fy)) {
            world.set(fx, fy, 6); // 火
            world.wakeArea(fx, fy);
            break;
          }
        }
      }

      // 耐酸较弱
      if (nid === 9 && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Cerium);
