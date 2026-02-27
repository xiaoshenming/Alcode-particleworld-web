import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铼合金 —— 超高温耐热合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2700° → 液态铌铼(482)
 * - 极耐酸腐蚀
 * - 银白色带暖灰金属光泽
 */

export const NiobiumRheniumAlloy: MaterialDef = {
  id: 481,
  name: '铌铼合金',
  category: '金属',
  description: '超高温耐热合金，用于火箭发动机和高温炉部件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 160 + Math.floor(Math.random() * 12);
      g = 158 + Math.floor(Math.random() * 10);
      b = 155 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 182 + Math.floor(Math.random() * 14);
      g = 178 + Math.floor(Math.random() * 12);
      b = 175 + Math.floor(Math.random() * 10);
    } else {
      r = 140 + Math.floor(Math.random() * 10);
      g = 136 + Math.floor(Math.random() * 10);
      b = 132 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2700) {
      world.set(x, y, 482);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0006) {
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

registerMaterial(NiobiumRheniumAlloy);
