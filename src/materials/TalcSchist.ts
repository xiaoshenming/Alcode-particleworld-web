import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 滑石片岩 —— 含滑石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1100° → 熔岩(11)
 * - 较易被酸腐蚀
 * - 灰白色带滑腻质感纹理
 */

export const TalcSchist: MaterialDef = {
  id: 569,
  name: '滑石片岩',
  category: '固体',
  description: '含滑石矿物的变质岩，指示低级变质和超基性岩变质条件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 205 + Math.floor(Math.random() * 12);
      g = 208 + Math.floor(Math.random() * 10);
      b = 202 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 222 + Math.floor(Math.random() * 12);
      g = 225 + Math.floor(Math.random() * 10);
      b = 218 + Math.floor(Math.random() * 10);
    } else {
      r = 188 + Math.floor(Math.random() * 10);
      g = 192 + Math.floor(Math.random() * 10);
      b = 185 + Math.floor(Math.random() * 8);
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

      if (nid === 9 && Math.random() < 0.004) {
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

registerMaterial(TalcSchist);
