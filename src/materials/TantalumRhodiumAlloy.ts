import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钽铑合金 —— 超耐蚀催化合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2450° → 液态钽铑(742)
 * - 极耐酸腐蚀
 * - 亮银白色带铑金属光泽
 */

export const TantalumRhodiumAlloy: MaterialDef = {
  id: 741,
  name: '钽铑合金',
  category: '金属',
  description: '超耐蚀催化合金，用于高温催化和极端腐蚀环境',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 205 + Math.floor(Math.random() * 10);
      g = 210 + Math.floor(Math.random() * 10);
      b = 215 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 215 + Math.floor(Math.random() * 11);
      g = 220 + Math.floor(Math.random() * 11);
      b = 225 + Math.floor(Math.random() * 11);
    } else {
      r = 205 + Math.floor(Math.random() * 8);
      g = 212 + Math.floor(Math.random() * 8);
      b = 218 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2450) {
      world.set(x, y, 742);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0001) {
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

registerMaterial(TantalumRhodiumAlloy);
