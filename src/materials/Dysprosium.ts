import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 镝 —— 稀土金属，强磁性
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1400° → 液态镝(332)
 * - 耐酸(9)较弱
 * - 导热(0.06)
 * - 银灰色带微黄光泽
 */

export const Dysprosium: MaterialDef = {
  id: 331,
  name: '镝',
  category: '金属',
  description: '稀土金属，强磁性，用于永磁材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰
      r = 175 + Math.floor(Math.random() * 15);
      g = 178 + Math.floor(Math.random() * 15);
      b = 172 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗银
      const base = 150 + Math.floor(Math.random() * 15);
      r = base + 2;
      g = base + 3;
      b = base;
    } else {
      // 高光微黄
      r = 200 + Math.floor(Math.random() * 20);
      g = 198 + Math.floor(Math.random() * 18);
      b = 185 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1400) {
      world.set(x, y, 332);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸较弱
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Dysprosium);
