import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 闪长岩 —— 中性深成岩
 * - 固体，密度 Infinity（不可移动）
 * - 极耐高温（>2500° 才熔化为熔岩）
 * - 耐酸性极好（概率0.001）
 * - 深灰色带蓝色闪光
 */

export const Larvikite: MaterialDef = {
  id: 429,
  name: '闪长岩',
  category: '固体',
  description: '中性深成岩，深灰色带蓝色闪光，极其坚硬耐腐蚀',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 深灰基底
      r = 75 + Math.floor(Math.random() * 15);
      g = 80 + Math.floor(Math.random() * 12);
      b = 90 + Math.floor(Math.random() * 15);
    } else if (phase < 0.85) {
      // 蓝色闪光
      r = 60 + Math.floor(Math.random() * 10);
      g = 75 + Math.floor(Math.random() * 15);
      b = 120 + Math.floor(Math.random() * 30);
    } else {
      // 浅灰斑点
      r = 110 + Math.floor(Math.random() * 15);
      g = 115 + Math.floor(Math.random() * 12);
      b = 120 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 2500) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐酸
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 缓慢导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Larvikite);
