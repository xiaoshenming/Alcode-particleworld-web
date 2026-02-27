import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钽铼合金 —— 超高温耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >3050° → 液态钽铼(667)
 * - 极耐酸腐蚀
 * - 银白色带暗灰调金属光泽
 */

export const TantalumRheniumAlloy: MaterialDef = {
  id: 666,
  name: '钽铼合金',
  category: '金属',
  description: '超高温耐蚀合金，用于航天推进系统和高温热电偶',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 178 + Math.floor(Math.random() * 12);
      g = 180 + Math.floor(Math.random() * 10);
      b = 185 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 195 + Math.floor(Math.random() * 14);
      g = 198 + Math.floor(Math.random() * 12);
      b = 202 + Math.floor(Math.random() * 10);
    } else {
      r = 162 + Math.floor(Math.random() * 10);
      g = 165 + Math.floor(Math.random() * 10);
      b = 170 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 3050) {
      world.set(x, y, 667);
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

registerMaterial(TantalumRheniumAlloy);
