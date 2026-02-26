import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽钒合金 —— 高强度耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2750° → 液态钽钒(677)
 * - 极耐酸腐蚀
 * - 银灰色带暗钒蓝调金属光泽
 */

export const TantalumVanadiumAlloy: MaterialDef = {
  id: 676,
  name: '钽钒合金',
  category: '金属',
  description: '高强度耐蚀合金，用于航空发动机和化工反应器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 158 + Math.floor(Math.random() * 12);
      g = 165 + Math.floor(Math.random() * 10);
      b = 175 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 172 + Math.floor(Math.random() * 14);
      g = 180 + Math.floor(Math.random() * 12);
      b = 192 + Math.floor(Math.random() * 10);
    } else {
      r = 145 + Math.floor(Math.random() * 10);
      g = 150 + Math.floor(Math.random() * 10);
      b = 162 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2750) {
      world.set(x, y, 677);
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

registerMaterial(TantalumVanadiumAlloy);
