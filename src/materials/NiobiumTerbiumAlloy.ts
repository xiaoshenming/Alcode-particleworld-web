import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铽合金 —— 磁光效应合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2280° → 液态铌铽(607)
 * - 极耐酸腐蚀
 * - 银灰色带淡绿调金属光泽
 */

export const NiobiumTerbiumAlloy: MaterialDef = {
  id: 606,
  name: '铌铽合金',
  category: '金属',
  description: '磁光效应合金，用于法拉第旋转器和磁光存储介质',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 182 + Math.floor(Math.random() * 12);
      g = 192 + Math.floor(Math.random() * 10);
      b = 185 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 198 + Math.floor(Math.random() * 14);
      g = 210 + Math.floor(Math.random() * 12);
      b = 202 + Math.floor(Math.random() * 10);
    } else {
      r = 168 + Math.floor(Math.random() * 10);
      g = 178 + Math.floor(Math.random() * 10);
      b = 172 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2280) {
      world.set(x, y, 607);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.07) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(NiobiumTerbiumAlloy);
