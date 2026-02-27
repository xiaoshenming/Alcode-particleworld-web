import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铱 —— 最耐腐蚀的金属之一
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 2446° → 变为液态铱(267)
 * - 极耐腐蚀：几乎不受任何酸影响
 * - 良好导热
 * - 银白色带微黄光泽
 */

export const Iridium: MaterialDef = {
  id: 266,
  name: '铱',
  category: '金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银白
      const base = 190 + Math.floor(Math.random() * 20);
      r = base + 3;
      g = base + 2;
      b = base;
    } else if (phase < 0.7) {
      // 微黄光泽
      const base = 180 + Math.floor(Math.random() * 15);
      r = base + 8;
      g = base + 5;
      b = base - 5;
    } else {
      // 高光
      const base = 210 + Math.floor(Math.random() * 25);
      r = base + 5;
      g = base + 3;
      b = base;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 2446) {
      world.set(x, y, 267);
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

      // 极耐腐蚀：酸几乎无效
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.001) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.13) {
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

registerMaterial(Iridium);
