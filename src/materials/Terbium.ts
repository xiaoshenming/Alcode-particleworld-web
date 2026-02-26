import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铽 —— 稀土金属，强磁致伸缩性
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1356° → 液态铽(342)
 * - 耐酸(9)较弱
 * - 导热(0.06)
 * - 银灰色带微绿光泽
 */

export const Terbium: MaterialDef = {
  id: 341,
  name: '铽',
  category: '金属',
  description: '稀土金属，强磁致伸缩性，用于声纳和传感器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 170 + Math.floor(Math.random() * 15);
      g = 180 + Math.floor(Math.random() * 15);
      b = 175 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      const base = 148 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 5;
      b = base + 2;
    } else {
      r = 195 + Math.floor(Math.random() * 20);
      g = 205 + Math.floor(Math.random() * 18);
      b = 192 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1356) {
      world.set(x, y, 342);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
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

registerMaterial(Terbium);
