import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 高纯氟化钬钇 —— 高纯度钬钇双稀土氟化物
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)产生热量+40
 * - 遇磁铁(42)产生火花(28)
 * - 淡黄绿色
 */

export const HighPurityHolmiumYttriumFluoride: MaterialDef = {
  id: 1038,
  name: '高纯氟化钬钇',
  category: '固体',
  description: '高纯度钬钇双稀土氟化物，用于磁致冷材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 200 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 20);
      b = 185 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 210 + Math.floor(Math.random() * 10);
      g = 225 + Math.floor(Math.random() * 10);
      b = 195 + Math.floor(Math.random() * 10);
    } else {
      r = 200 + Math.floor(Math.random() * 8);
      g = 215 + Math.floor(Math.random() * 8);
      b = 185 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 与电线接触产生热量
      if (nid === 44 && Math.random() < 0.04) {
        world.addTemp(x, y, 40);
        world.wakeArea(x, y);
      }

      // 与磁铁接触产生火花
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
          world.wakeArea(x, fy);
        }
      }

      // 温度传导
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(HighPurityHolmiumYttriumFluoride);
