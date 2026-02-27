import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钽锰合金 —— 高强度耐磨合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2350° → 液态钽锰(707)
 * - 耐酸腐蚀
 * - 银灰色带暗锰紫调金属光泽
 */

export const TantalumManganeseAlloy: MaterialDef = {
  id: 706,
  name: '钽锰合金',
  category: '金属',
  description: '高强度耐磨合金，用于切削工具和耐磨衬板',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 12);
      g = 148 + Math.floor(Math.random() * 10);
      b = 158 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 168 + Math.floor(Math.random() * 14);
      g = 162 + Math.floor(Math.random() * 12);
      b = 172 + Math.floor(Math.random() * 10);
    } else {
      r = 142 + Math.floor(Math.random() * 10);
      g = 135 + Math.floor(Math.random() * 10);
      b = 145 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2350) {
      world.set(x, y, 707);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
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

registerMaterial(TantalumManganeseAlloy);
