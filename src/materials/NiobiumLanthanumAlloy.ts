import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌镧合金 —— 稀土改性耐热合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2050° → 液态铌镧(592)
 * - 较耐酸腐蚀
 * - 银灰色带淡金调金属光泽
 */

export const NiobiumLanthanumAlloy: MaterialDef = {
  id: 591,
  name: '铌镧合金',
  category: '金属',
  description: '稀土改性耐热合金，用于电子发射阴极和储氢材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 178 + Math.floor(Math.random() * 12);
      g = 175 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 198 + Math.floor(Math.random() * 14);
      g = 195 + Math.floor(Math.random() * 12);
      b = 182 + Math.floor(Math.random() * 10);
    } else {
      r = 162 + Math.floor(Math.random() * 10);
      g = 158 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2050) {
      world.set(x, y, 592);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0004) {
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

registerMaterial(NiobiumLanthanumAlloy);
