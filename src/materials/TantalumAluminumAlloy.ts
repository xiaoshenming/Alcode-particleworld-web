import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽铝合金 —— 轻质高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2250° → 液态钽铝(717)
 * - 耐酸腐蚀
 * - 银白色带淡铝灰调金属光泽
 */

export const TantalumAluminumAlloy: MaterialDef = {
  id: 716,
  name: '钽铝合金',
  category: '金属',
  description: '轻质高温合金，用于航空发动机和涡轮叶片',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 185 + Math.floor(Math.random() * 12);
      g = 190 + Math.floor(Math.random() * 10);
      b = 195 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 198 + Math.floor(Math.random() * 14);
      g = 202 + Math.floor(Math.random() * 12);
      b = 208 + Math.floor(Math.random() * 10);
    } else {
      r = 172 + Math.floor(Math.random() * 10);
      g = 178 + Math.floor(Math.random() * 10);
      b = 182 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2250) {
      world.set(x, y, 717);
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

registerMaterial(TantalumAluminumAlloy);
