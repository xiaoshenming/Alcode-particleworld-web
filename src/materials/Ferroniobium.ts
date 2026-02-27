import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铁合金 —— 高强度耐热合金
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>2400° → 液态铌铁(327)
 * - 极耐酸(9)
 * - 良好导热(0.08)
 * - 深灰色带蓝色金属光泽
 */

export const Ferroniobium: MaterialDef = {
  id: 326,
  name: '铌铁合金',
  category: '金属',
  description: '高强度耐热合金',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深灰蓝
      r = 95 + Math.floor(Math.random() * 15);
      g = 100 + Math.floor(Math.random() * 15);
      b = 115 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗钢灰
      const base = 80 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 3;
      b = base + 8;
    } else {
      // 高光
      r = 130 + Math.floor(Math.random() * 20);
      g = 135 + Math.floor(Math.random() * 20);
      b = 150 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 2400) {
      world.set(x, y, 327);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐酸
      if (nid === 9 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
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

registerMaterial(Ferroniobium);
