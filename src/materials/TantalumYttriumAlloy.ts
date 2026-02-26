import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽钇合金 —— 高温结构合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2360° → 液态钽钇(767)
 * - 极耐酸腐蚀
 * - 银灰色带钇金属光泽
 */

export const TantalumYttriumAlloy: MaterialDef = {
  id: 766,
  name: '钽钇合金',
  category: '金属',
  description: '高温结构合金，用于航空发动机和核反应堆部件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 190 + Math.floor(Math.random() * 21);
      g = 195 + Math.floor(Math.random() * 21);
      b = 200 + Math.floor(Math.random() * 21);
    } else if (phase < 0.8) {
      r = 200 + Math.floor(Math.random() * 10);
      g = 205 + Math.floor(Math.random() * 10);
      b = 210 + Math.floor(Math.random() * 10);
    } else {
      r = 185 + Math.floor(Math.random() * 10);
      g = 190 + Math.floor(Math.random() * 10);
      b = 195 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2360) {
      world.set(x, y, 767);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
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

registerMaterial(TantalumYttriumAlloy);
