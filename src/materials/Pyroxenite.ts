import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 辉岩 —— 深色超基性岩
 * - 固体，密度 Infinity（不可移动）
 * - 极耐高温（>2800° 才熔化为熔岩）
 * - 耐酸性极好（概率0.001）
 * - 深绿黑色，带橄榄石斑点
 */

export const Pyroxenite: MaterialDef = {
  id: 434,
  name: '辉岩',
  category: '固体',
  description: '深色超基性岩，由辉石矿物组成，极其坚硬致密',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.55) {
      r = 35 + Math.floor(Math.random() * 15);
      g = 45 + Math.floor(Math.random() * 15);
      b = 30 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 55 + Math.floor(Math.random() * 12);
      g = 58 + Math.floor(Math.random() * 10);
      b = 52 + Math.floor(Math.random() * 10);
    } else {
      r = 80 + Math.floor(Math.random() * 20);
      g = 100 + Math.floor(Math.random() * 20);
      b = 50 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2800) {
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

      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Pyroxenite);
