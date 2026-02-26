import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 锇 —— 密度最高的天然金属元素
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>3033° → 液态锇(312)
 * - 极硬：酸(9)几乎无法溶解
 * - 良好导热(0.08)
 * - 蓝灰色带金属光泽
 */

export const Osmium: MaterialDef = {
  id: 311,
  name: '锇',
  category: '金属',
  description: '密度最高的天然金属元素',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 蓝灰色
      r = 140 + Math.floor(Math.random() * 15);
      g = 150 + Math.floor(Math.random() * 15);
      b = 170 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗蓝灰
      r = 115 + Math.floor(Math.random() * 10);
      g = 125 + Math.floor(Math.random() * 10);
      b = 145 + Math.floor(Math.random() * 15);
    } else {
      // 高光
      r = 175 + Math.floor(Math.random() * 20);
      g = 185 + Math.floor(Math.random() * 20);
      b = 205 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高熔点
    if (temp > 3033) {
      world.set(x, y, 312);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐酸：极低概率溶解
      if (nid === 9 && Math.random() < 0.002) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 良好导热
      if (nid !== 0 && Math.random() < 0.08) {
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

registerMaterial(Osmium);
