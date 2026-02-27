import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铜合金 —— 高导电高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1800° → 液态铌铜(527)
 * - 耐酸腐蚀
 * - 铜红色带银灰金属光泽
 */

export const NiobiumCopperAlloy: MaterialDef = {
  id: 526,
  name: '铌铜合金',
  category: '金属',
  description: '高导电高温合金，用于电触点和超导线材',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 185 + Math.floor(Math.random() * 12);
      g = 135 + Math.floor(Math.random() * 10);
      b = 120 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 200 + Math.floor(Math.random() * 14);
      g = 155 + Math.floor(Math.random() * 12);
      b = 140 + Math.floor(Math.random() * 10);
    } else {
      r = 165 + Math.floor(Math.random() * 10);
      g = 118 + Math.floor(Math.random() * 10);
      b = 105 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1800) {
      world.set(x, y, 527);
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

registerMaterial(NiobiumCopperAlloy);
