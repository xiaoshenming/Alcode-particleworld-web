import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽钼合金 —— 高温高强合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2900° → 液态钽钼(662)
 * - 极耐酸腐蚀
 * - 银灰色带暗紫调金属光泽
 */

export const TantalumMolybdenumAlloy: MaterialDef = {
  id: 661,
  name: '钽钼合金',
  category: '金属',
  description: '高温高强合金，用于核反应堆部件和高温炉构件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 165 + Math.floor(Math.random() * 12);
      g = 160 + Math.floor(Math.random() * 10);
      b = 178 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 182 + Math.floor(Math.random() * 14);
      g = 178 + Math.floor(Math.random() * 12);
      b = 195 + Math.floor(Math.random() * 10);
    } else {
      r = 148 + Math.floor(Math.random() * 10);
      g = 145 + Math.floor(Math.random() * 10);
      b = 162 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2900) {
      world.set(x, y, 662);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0002) {
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

registerMaterial(TantalumMolybdenumAlloy);
