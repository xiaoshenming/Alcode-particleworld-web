import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 橄榄片岩 —— 含橄榄石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1400° → 熔岩(11)
 * - 耐酸腐蚀
 * - 橄榄绿色带暗色条纹
 */

export const OlivineSchist: MaterialDef = {
  id: 514,
  name: '橄榄片岩',
  category: '固体',
  description: '含橄榄石矿物的变质岩，来源于上地幔岩石变质',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 75 + Math.floor(Math.random() * 12);
      g = 95 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 90 + Math.floor(Math.random() * 12);
      g = 115 + Math.floor(Math.random() * 12);
      b = 55 + Math.floor(Math.random() * 10);
    } else {
      r = 60 + Math.floor(Math.random() * 8);
      g = 78 + Math.floor(Math.random() * 10);
      b = 35 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1400) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
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

registerMaterial(OlivineSchist);
