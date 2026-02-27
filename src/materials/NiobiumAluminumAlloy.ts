import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铝合金 —— 轻质高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2000° → 液态铌铝(522)
 * - 耐酸腐蚀
 * - 浅银色带铝白金属光泽
 */

export const NiobiumAluminumAlloy: MaterialDef = {
  id: 521,
  name: '铌铝合金',
  category: '金属',
  description: '轻质高温合金，用于航空发动机和高温结构件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 172 + Math.floor(Math.random() * 12);
      g = 175 + Math.floor(Math.random() * 10);
      b = 178 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 195 + Math.floor(Math.random() * 14);
      g = 198 + Math.floor(Math.random() * 12);
      b = 202 + Math.floor(Math.random() * 10);
    } else {
      r = 150 + Math.floor(Math.random() * 10);
      g = 153 + Math.floor(Math.random() * 10);
      b = 156 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2000) {
      world.set(x, y, 522);
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

registerMaterial(NiobiumAluminumAlloy);
