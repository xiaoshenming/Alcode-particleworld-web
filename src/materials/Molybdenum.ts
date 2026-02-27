import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钼 —— 高熔点过渡金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 2623° → 变为液态钼(257)
 * - 极耐高温，仅次于钨
 * - 耐大多数酸腐蚀，仅王水可缓慢溶解
 * - 良好导热
 * - 银灰色带蓝调金属光泽
 */

export const Molybdenum: MaterialDef = {
  id: 256,
  name: '钼',
  category: '金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银灰色
      const base = 175 + Math.floor(Math.random() * 20);
      r = base - 5;
      g = base;
      b = base + 10;
    } else if (phase < 0.7) {
      // 蓝灰
      const base = 160 + Math.floor(Math.random() * 15);
      r = base - 8;
      g = base;
      b = base + 15;
    } else {
      // 高光
      const base = 200 + Math.floor(Math.random() * 25);
      r = base - 3;
      g = base + 2;
      b = Math.min(255, base + 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 2623) {
      world.set(x, y, 257);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸：普通酸蒸发
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.003) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 良好导热
      if (nid !== 0 && Math.random() < 0.15) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const avg = (temp + nt) / 2;
          world.setTemp(x, y, avg);
          world.setTemp(nx, ny, avg);
        }
      }
    }
  },
};

registerMaterial(Molybdenum);
