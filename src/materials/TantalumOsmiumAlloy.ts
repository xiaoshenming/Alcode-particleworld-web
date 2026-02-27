import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽锇合金 —— 超高密度耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2700° → 液态钽锇(752)
 * - 极耐酸腐蚀
 * - 深银灰色带锇金属光泽
 */

export const TantalumOsmiumAlloy: MaterialDef = {
  id: 751,
  name: '钽锇合金',
  category: '金属',
  description: '超高密度耐蚀合金，用于极端环境下的耐磨耐蚀部件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 178 + Math.floor(Math.random() * 12);
      g = 182 + Math.floor(Math.random() * 10);
      b = 190 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 190 + Math.floor(Math.random() * 8);
      g = 195 + Math.floor(Math.random() * 7);
      b = 202 + Math.floor(Math.random() * 8);
    } else {
      r = 185 + Math.floor(Math.random() * 13);
      g = 190 + Math.floor(Math.random() * 12);
      b = 198 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2700) {
      world.set(x, y, 752);
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

registerMaterial(TantalumOsmiumAlloy);
