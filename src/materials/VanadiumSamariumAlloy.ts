import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钒钐合金 —— 钒与钐的高强度稀土合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2200° → 液态钒钐(1122)
 * - 耐酸腐蚀
 */

export const VanadiumSamariumAlloy: MaterialDef = {
  id: 1121,
  name: '钒钐合金',
  category: '固体',
  description: '钒与钐的合金，结合钒的高强度与钐的磁学特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 168 + Math.floor(Math.random() * 18);
      g = 174 + Math.floor(Math.random() * 18);
      b = 186 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 178 + Math.floor(Math.random() * 10);
      g = 184 + Math.floor(Math.random() * 10);
      b = 196 + Math.floor(Math.random() * 10);
    } else {
      r = 164 + Math.floor(Math.random() * 8);
      g = 168 + Math.floor(Math.random() * 8);
      b = 182 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
      world.set(x, y, 1122);
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

registerMaterial(VanadiumSamariumAlloy);
