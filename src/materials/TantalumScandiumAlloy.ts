import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽钪合金 —— 轻质高强耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2320° → 液态钽钪(762)
 * - 极耐酸腐蚀
 * - 浅银灰色带钪金属光泽
 */

export const TantalumScandiumAlloy: MaterialDef = {
  id: 761,
  name: '钽钪合金',
  category: '金属',
  description: '轻质高强耐蚀合金，用于航空航天和高性能结构件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 195 + Math.floor(Math.random() * 10);
      g = 200 + Math.floor(Math.random() * 10);
      b = 205 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 208 + Math.floor(Math.random() * 12);
      g = 213 + Math.floor(Math.random() * 12);
      b = 218 + Math.floor(Math.random() * 12);
    } else {
      r = 185 + Math.floor(Math.random() * 10);
      g = 190 + Math.floor(Math.random() * 10);
      b = 195 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2320) {
      world.set(x, y, 762);
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

registerMaterial(TantalumScandiumAlloy);
