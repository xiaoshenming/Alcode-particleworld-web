import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铑 —— 稀有贵金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 1964° → 变为液态铑(272)
 * - 极耐腐蚀：几乎不受酸影响
 * - 优良导热/反射性
 * - 银白色带明亮光泽
 */

export const Rhodium: MaterialDef = {
  id: 271,
  name: '铑',
  category: '金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银白
      const base = 195 + Math.floor(Math.random() * 20);
      r = base + 2;
      g = base + 1;
      b = base;
    } else if (phase < 0.7) {
      // 明亮光泽
      const base = 215 + Math.floor(Math.random() * 25);
      r = base + 3;
      g = base + 2;
      b = base;
    } else {
      // 高光反射
      const base = 230 + Math.floor(Math.random() * 20);
      r = base + 5;
      g = base + 3;
      b = base + 1;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 1964) {
      world.set(x, y, 272);
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

      // 优良导热
      if (nid !== 0 && Math.random() < 0.15) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 3) {
          const avg = (temp + nt) / 2;
          world.setTemp(x, y, avg);
          world.setTemp(nx, ny, avg);
        }
      }
    }
  },
};

registerMaterial(Rhodium);
