import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 锡青铜 —— 铜锡合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 1000°C → 变为液态锡青铜(237)
 * - 耐腐蚀：普通酸无效，仅硝酸(183)可缓慢腐蚀
 * - 良好导热性
 * - 青铜色金属光泽
 */

export const TinBronze: MaterialDef = {
  id: 236,
  name: '锡青铜',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 青铜色
      r = 175 + Math.floor(Math.random() * 25);
      g = 135 + Math.floor(Math.random() * 20);
      b = 65 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 深青铜
      r = 150 + Math.floor(Math.random() * 20);
      g = 110 + Math.floor(Math.random() * 20);
      b = 50 + Math.floor(Math.random() * 15);
    } else {
      // 金属高光
      r = 200 + Math.floor(Math.random() * 25);
      g = 165 + Math.floor(Math.random() * 25);
      b = 85 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 1000) {
      world.set(x, y, 237); // 液态锡青铜
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

      // 仅硝酸可腐蚀
      if (nid === 183 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
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

registerMaterial(TinBronze);
