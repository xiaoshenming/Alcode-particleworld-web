import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铅 —— 灰蓝色重金属
 * - 固体，密度 Infinity（不可移动）
 * - 低熔点：>327° 熔化为液态铅(227)
 * - 遇酸缓慢腐蚀（硝酸较快）
 * - 有毒：接触水缓慢污染（水变为毒水/沼泽54）
 * - 灰蓝色，表面暗淡
 */

export const Lead: MaterialDef = {
  id: 226,
  name: '铅',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 灰蓝色
      const base = 120 + Math.floor(Math.random() * 25);
      r = base - 5;
      g = base;
      b = base + 12;
    } else if (phase < 0.85) {
      // 暗灰色
      const base = 100 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 8;
    } else {
      // 微光泽
      const base = 145 + Math.floor(Math.random() * 20);
      r = base - 3;
      g = base;
      b = base + 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低熔点熔化
    if (temp > 327) {
      world.set(x, y, 227); // 液态铅
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

      // 遇硝酸较快腐蚀
      if (nid === 183 && Math.random() < 0.015) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 遇其他酸缓慢腐蚀
      if ((nid === 9 || nid === 173) && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 污染水源
      if (nid === 2 && Math.random() < 0.003) {
        world.set(nx, ny, 54); // 水变沼泽（毒水）
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(Lead);
