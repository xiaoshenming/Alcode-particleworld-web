import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 皂石片麻岩 —— 含皂石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1100° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 灰绿色带滑腻质感条带
 */

export const SoapstoneGneiss: MaterialDef = {
  id: 634,
  name: '皂石片麻岩',
  category: '固体',
  description: '含皂石矿物的片麻岩，质地细腻具有滑腻感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 128 + Math.floor(Math.random() * 12);
      g = 142 + Math.floor(Math.random() * 10);
      b = 132 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 145 + Math.floor(Math.random() * 10);
      g = 158 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 10);
    } else {
      r = 115 + Math.floor(Math.random() * 10);
      g = 128 + Math.floor(Math.random() * 10);
      b = 120 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1100) {
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

      if (nid === 9 && Math.random() < 0.003) {
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

registerMaterial(SoapstoneGneiss);
