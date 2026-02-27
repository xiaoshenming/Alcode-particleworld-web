import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钴 —— 蓝色过渡金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 1495°C → 变为液态钴(232)
 * - 磁性：可被电磁铁(230)吸引（当为粉末态时）
 * - 耐腐蚀：普通酸无效，仅硝酸(183)可缓慢腐蚀
 * - 蓝灰色金属光泽
 */

export const Cobalt: MaterialDef = {
  id: 231,
  name: '钴',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 蓝灰色
      r = 90 + Math.floor(Math.random() * 20);
      g = 100 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 深蓝灰
      r = 75 + Math.floor(Math.random() * 15);
      g = 85 + Math.floor(Math.random() * 15);
      b = 125 + Math.floor(Math.random() * 20);
    } else {
      // 金属高光
      r = 120 + Math.floor(Math.random() * 30);
      g = 130 + Math.floor(Math.random() * 25);
      b = 165 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 1495) {
      world.set(x, y, 232); // 液态钴
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
      if (nid === 183 && Math.random() < 0.015) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 传导热量
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

registerMaterial(Cobalt);
