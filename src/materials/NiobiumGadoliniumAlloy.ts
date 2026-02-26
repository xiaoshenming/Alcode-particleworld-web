import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌钆合金 —— 磁制冷合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2220° → 液态铌钆(622)
 * - 极耐酸腐蚀
 * - 银灰色带冷白调金属光泽
 */

export const NiobiumGadoliniumAlloy: MaterialDef = {
  id: 621,
  name: '铌钆合金',
  category: '金属',
  description: '磁制冷合金，用于磁热效应制冷和低温超导磁体',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 190 + Math.floor(Math.random() * 12);
      g = 195 + Math.floor(Math.random() * 10);
      b = 200 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 208 + Math.floor(Math.random() * 14);
      g = 212 + Math.floor(Math.random() * 12);
      b = 218 + Math.floor(Math.random() * 10);
    } else {
      r = 175 + Math.floor(Math.random() * 10);
      g = 180 + Math.floor(Math.random() * 10);
      b = 185 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2220) {
      world.set(x, y, 622);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
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

registerMaterial(NiobiumGadoliniumAlloy);
