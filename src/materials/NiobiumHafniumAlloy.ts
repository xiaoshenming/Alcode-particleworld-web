import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铪合金 —— 超高温结构合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2500° → 液态铌铪(472)
 * - 极耐酸腐蚀
 * - 深银色带暖灰金属光泽
 */

export const NiobiumHafniumAlloy: MaterialDef = {
  id: 471,
  name: '铌铪合金',
  category: '金属',
  description: '超高温结构合金，用于航天发动机喷嘴和核反应堆',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 12);
      g = 150 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 178 + Math.floor(Math.random() * 12);
      g = 172 + Math.floor(Math.random() * 10);
      b = 168 + Math.floor(Math.random() * 10);
    } else {
      r = 135 + Math.floor(Math.random() * 10);
      g = 128 + Math.floor(Math.random() * 10);
      b = 125 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2500) {
      world.set(x, y, 472);
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

registerMaterial(NiobiumHafniumAlloy);
