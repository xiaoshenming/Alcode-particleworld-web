import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 石榴片岩 —— 含石榴石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1350° → 熔岩(11)
 * - 耐酸腐蚀
 * - 暗红褐色带石榴石斑晶
 */

export const GarnetSchist: MaterialDef = {
  id: 519,
  name: '石榴片岩',
  category: '固体',
  description: '含石榴石矿物的变质岩，指示中高级变质条件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 95 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 10);
      b = 52 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 130 + Math.floor(Math.random() * 15);
      g = 45 + Math.floor(Math.random() * 12);
      b = 50 + Math.floor(Math.random() * 10);
    } else {
      r = 75 + Math.floor(Math.random() * 10);
      g = 60 + Math.floor(Math.random() * 8);
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

registerMaterial(GarnetSchist);
