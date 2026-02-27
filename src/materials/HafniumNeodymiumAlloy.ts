import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铪钕合金 —— 稀土磁性高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2340° → 液态铪钕(837)
 * - 极耐酸腐蚀
 * - 银灰色带淡紫色调
 */

export const HafniumNeodymiumAlloy: MaterialDef = {
  id: 836,
  name: '铪钕合金',
  category: '金属',
  description: '稀土磁性高温合金，用于永磁电机和高温磁性器件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 190 + Math.floor(Math.random() * 20);
      g = 186 + Math.floor(Math.random() * 20);
      b = 196 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 200 + Math.floor(Math.random() * 10);
      g = 196 + Math.floor(Math.random() * 10);
      b = 206 + Math.floor(Math.random() * 10);
    } else {
      r = 190 + Math.floor(Math.random() * 8);
      g = 186 + Math.floor(Math.random() * 8);
      b = 196 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2340) {
      world.set(x, y, 837);
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

registerMaterial(HafniumNeodymiumAlloy);
