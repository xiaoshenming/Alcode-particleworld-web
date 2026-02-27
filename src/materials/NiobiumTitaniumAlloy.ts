import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌钛合金 —— 超导低温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2350° → 液态铌钛(497)
 * - 耐酸腐蚀
 * - 浅银色带冷灰金属光泽
 */

export const NiobiumTitaniumAlloy: MaterialDef = {
  id: 496,
  name: '铌钛合金',
  category: '金属',
  description: '超导低温合金，用于MRI磁体和粒子加速器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 165 + Math.floor(Math.random() * 12);
      g = 168 + Math.floor(Math.random() * 10);
      b = 172 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 188 + Math.floor(Math.random() * 14);
      g = 190 + Math.floor(Math.random() * 12);
      b = 195 + Math.floor(Math.random() * 10);
    } else {
      r = 145 + Math.floor(Math.random() * 10);
      g = 148 + Math.floor(Math.random() * 10);
      b = 152 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2350) {
      world.set(x, y, 497);
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

registerMaterial(NiobiumTitaniumAlloy);
