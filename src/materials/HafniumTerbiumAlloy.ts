import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铪铽合金 —— 高温耐热稀土合金
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>2200° → 液态铪铽(337)
 * - 极耐酸(9)
 * - 导热(0.07)
 * - 银灰色带淡金光泽
 */

export const HafniumTerbiumAlloy: MaterialDef = {
  id: 336,
  name: '铪铽合金',
  category: '金属',
  description: '高温耐热稀土合金',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 170 + Math.floor(Math.random() * 15);
      g = 168 + Math.floor(Math.random() * 15);
      b = 160 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      const base = 145 + Math.floor(Math.random() * 15);
      r = base + 5;
      g = base + 3;
      b = base;
    } else {
      r = 200 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 18);
      b = 180 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
      world.set(x, y, 337);
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

      if (nid !== 0 && Math.random() < 0.07) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(HafniumTerbiumAlloy);
