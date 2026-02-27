import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钒钬合金 —— 钒与钬的高强度稀土合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2200° → 液态钒钬(1112)
 * - 耐酸腐蚀
 */

export const VanadiumHolmiumAlloy: MaterialDef = {
  id: 1111,
  name: '钒钬合金',
  category: '固体',
  description: '钒与钬的合金，结合钒的高强度与钬的磁学特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 175 + Math.floor(Math.random() * 18);
      g = 178 + Math.floor(Math.random() * 18);
      b = 168 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 185 + Math.floor(Math.random() * 10);
      g = 188 + Math.floor(Math.random() * 10);
      b = 178 + Math.floor(Math.random() * 10);
    } else {
      r = 170 + Math.floor(Math.random() * 8);
      g = 172 + Math.floor(Math.random() * 8);
      b = 164 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
      world.set(x, y, 1112);
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

registerMaterial(VanadiumHolmiumAlloy);
