import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钽铂合金 —— 超耐蚀贵金属合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2500° → 液态钽铂(732)
 * - 极耐酸腐蚀
 * - 银白色带铂金光泽金属
 */

export const TantalumPlatinumAlloy: MaterialDef = {
  id: 731,
  name: '钽铂合金',
  category: '金属',
  description: '超耐蚀贵金属合金，用于高端化工和医疗植入器件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 200 + Math.floor(Math.random() * 10);
      g = 205 + Math.floor(Math.random() * 10);
      b = 210 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 212 + Math.floor(Math.random() * 8);
      g = 218 + Math.floor(Math.random() * 7);
      b = 222 + Math.floor(Math.random() * 8);
    } else {
      r = 205 + Math.floor(Math.random() * 10);
      g = 210 + Math.floor(Math.random() * 10);
      b = 215 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2500) {
      world.set(x, y, 732);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
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

registerMaterial(TantalumPlatinumAlloy);
