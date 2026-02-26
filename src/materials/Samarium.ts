import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钐 —— 稀土金属，用于永磁体
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1072° → 液态钐(347)
 * - 耐酸(9)较弱
 * - 导热(0.05)
 * - 银白色带微黄光泽
 */

export const Samarium: MaterialDef = {
  id: 346,
  name: '钐',
  category: '金属',
  description: '稀土金属，用于制造强力永磁体',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 180 + Math.floor(Math.random() * 15);
      g = 178 + Math.floor(Math.random() * 15);
      b = 170 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      const base = 155 + Math.floor(Math.random() * 15);
      r = base + 3;
      g = base + 2;
      b = base;
    } else {
      r = 205 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 18);
      b = 188 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1072) {
      world.set(x, y, 347);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.025) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.05) {
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

registerMaterial(Samarium);
