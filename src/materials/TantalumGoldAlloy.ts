import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽金合金 —— 高耐蚀贵金属合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2400° → 液态钽金(727)
 * - 极耐酸腐蚀
 * - 金色带银灰光泽金属
 */

export const TantalumGoldAlloy: MaterialDef = {
  id: 726,
  name: '钽金合金',
  category: '金属',
  description: '高耐蚀贵金属合金，用于航天耐蚀部件和高端珠宝',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 205 + Math.floor(Math.random() * 10);
      g = 190 + Math.floor(Math.random() * 10);
      b = 120 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 215 + Math.floor(Math.random() * 10);
      g = 200 + Math.floor(Math.random() * 10);
      b = 135 + Math.floor(Math.random() * 15);
    } else {
      r = 210 + Math.floor(Math.random() * 8);
      g = 195 + Math.floor(Math.random() * 8);
      b = 128 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2400) {
      world.set(x, y, 727);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.09;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(TantalumGoldAlloy);
