import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铑镧合金 —— 铑与镧的耐腐蚀稀土合金
 * - 固体，密度 Infinity
 * - 熔点 >2000° → 液态铑镧(1177)
 */

export const RhodiumLanthanumAlloy: MaterialDef = {
  id: 1176,
  name: '铑镧合金',
  category: '固体',
  description: '铑与镧的合金，结合铑的耐腐蚀性与镧的稀土特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 198 + Math.floor(Math.random() * 18);
      g = 200 + Math.floor(Math.random() * 18);
      b = 206 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 208 + Math.floor(Math.random() * 10);
      g = 210 + Math.floor(Math.random() * 10);
      b = 216 + Math.floor(Math.random() * 10);
    } else {
      r = 193 + Math.floor(Math.random() * 8);
      g = 195 + Math.floor(Math.random() * 8);
      b = 201 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 2000) {
      world.set(x, y, 1177);
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

registerMaterial(RhodiumLanthanumAlloy);
