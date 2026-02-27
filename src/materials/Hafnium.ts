import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铪 —— 高熔点过渡金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 2233° → 变为液态铪(262)
 * - 耐腐蚀：抗大多数酸
 * - 良好导热
 * - 银灰色带暗调
 */

export const Hafnium: MaterialDef = {
  id: 261,
  name: '铪',
  category: '金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银灰
      const base = 170 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.7) {
      // 暗灰
      const base = 145 + Math.floor(Math.random() * 15);
      r = base + 3;
      g = base;
      b = base + 2;
    } else {
      // 高光
      const base = 195 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 3;
      b = base + 8;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 2233) {
      world.set(x, y, 262);
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
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.005) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.12) {
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

registerMaterial(Hafnium);
