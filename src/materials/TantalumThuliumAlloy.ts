import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽铥合金 —— 稀土增强高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2350° → 液态钽铥(802)
 * - 极耐酸腐蚀
 * - 银灰色带淡蓝色调
 */

export const TantalumThuliumAlloy: MaterialDef = {
  id: 801,
  name: '钽铥合金',
  category: '金属',
  description: '稀土增强高温合金，用于核反应堆和X射线源',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 184 + Math.floor(Math.random() * 20);
      g = 188 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 194 + Math.floor(Math.random() * 10);
      g = 198 + Math.floor(Math.random() * 10);
      b = 210 + Math.floor(Math.random() * 10);
    } else {
      r = 184 + Math.floor(Math.random() * 8);
      g = 188 + Math.floor(Math.random() * 8);
      b = 200 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2350) {
      world.set(x, y, 802);
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

registerMaterial(TantalumThuliumAlloy);
