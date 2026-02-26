import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 镨 —— 稀土金属，浅绿色
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>935° → 液态镨(362)
 * - 接触石(3)时有概率产生火花（稀土特性）
 * - 耐酸(9)较弱（活泼稀土）
 * - 浅绿色带金属光泽
 */

export const Praseodymium: MaterialDef = {
  id: 361,
  name: '镨',
  category: '金属',
  description: '稀土金属，浅绿色固体，密度6.77，用于磁铁和合金',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 浅绿色金属
      r = 160 + Math.floor(Math.random() * 15);
      g = 190 + Math.floor(Math.random() * 15);
      b = 155 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗绿灰
      r = 140 + Math.floor(Math.random() * 12);
      g = 168 + Math.floor(Math.random() * 12);
      b = 138 + Math.floor(Math.random() * 10);
    } else {
      // 亮绿高光
      r = 178 + Math.floor(Math.random() * 18);
      g = 205 + Math.floor(Math.random() * 15);
      b = 170 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 935) {
      world.set(x, y, 362); // 液态镨
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触石头产生火花（稀土摩擦特性）
      if (nid === 3 && Math.random() < 0.02) {
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
        world.set(nx, ny, 7); // 烟
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

registerMaterial(Praseodymium);
