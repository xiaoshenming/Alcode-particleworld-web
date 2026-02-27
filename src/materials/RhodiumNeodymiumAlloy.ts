import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铑钕合金 —— 铑与钕的高性能稀土合金
 * - 固体，密度 Infinity
 * - 熔点 >2000° → 液态铑钕(1187)
 */

export const RhodiumNeodymiumAlloy: MaterialDef = {
  id: 1186,
  name: '铑钕合金',
  category: '固体',
  description: '铑与钕的合金，结合铑的耐腐蚀性与钕的强磁性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 194 + Math.floor(Math.random() * 18);
      g = 196 + Math.floor(Math.random() * 18);
      b = 208 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 204 + Math.floor(Math.random() * 10);
      g = 206 + Math.floor(Math.random() * 10);
      b = 218 + Math.floor(Math.random() * 10);
    } else {
      r = 189 + Math.floor(Math.random() * 8);
      g = 191 + Math.floor(Math.random() * 8);
      b = 203 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 2000) {
      world.set(x, y, 1187);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.09;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(RhodiumNeodymiumAlloy);
