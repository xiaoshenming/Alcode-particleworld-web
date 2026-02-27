import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铂 —— 贵金属，化学惰性极强
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 1768°C → 变为液态铂(252)
 * - 极耐腐蚀：几乎不被任何单一酸腐蚀（仅王水=硝酸+盐酸）
 * - 催化作用：加速邻近化学反应（如过氧化氢191分解）
 * - 优良导热
 * - 银白色带冷调光泽
 */

export const Platinum: MaterialDef = {
  id: 251,
  name: '铂',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银白色
      const base = 195 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 8;
    } else if (phase < 0.7) {
      // 冷灰白
      const base = 180 + Math.floor(Math.random() * 15);
      r = base - 3;
      g = base;
      b = base + 10;
    } else {
      // 高光
      const base = 220 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 2;
      b = Math.min(255, base + 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 1768) {
      world.set(x, y, 252); // 液态铂
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

      // 所有单一酸无效（酸蒸发）
      if ((nid === 9 || nid === 173 || nid === 183 || nid === 208) && Math.random() < 0.005) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 催化过氧化氢分解
      if (nid === 191 && Math.random() < 0.1) {
        world.set(nx, ny, 8); // 蒸汽（分解产物）
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 优良导热
      if (nid !== 0 && Math.random() < 0.2) {
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

registerMaterial(Platinum);
