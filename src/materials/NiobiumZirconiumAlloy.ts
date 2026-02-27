import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌锆合金 —— 高温超导合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2100° → 液态铌锆(467)
 * - 耐酸性强
 * - 银灰色带淡蓝金属光泽
 */

export const NiobiumZirconiumAlloy: MaterialDef = {
  id: 466,
  name: '铌锆合金',
  category: '金属',
  description: '高温超导合金，用于超导磁体和粒子加速器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 160 + Math.floor(Math.random() * 12);
      g = 168 + Math.floor(Math.random() * 10);
      b = 180 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 180 + Math.floor(Math.random() * 12);
      g = 188 + Math.floor(Math.random() * 10);
      b = 205 + Math.floor(Math.random() * 12);
    } else {
      r = 140 + Math.floor(Math.random() * 10);
      g = 148 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2100) {
      world.set(x, y, 467);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.002) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(NiobiumZirconiumAlloy);
