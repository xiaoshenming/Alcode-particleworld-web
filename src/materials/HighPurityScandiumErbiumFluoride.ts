import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 高纯氟化钪铒 —— 高纯度钪铒复合氟化物
 * - 固体，密度 Infinity
 * - 遇酸(9)缓慢溶解 (0.001)
 * - 热传导 0.05/0.06
 * - 淡蓝白色晶体
 */

export const HighPurityScandiumErbiumFluoride: MaterialDef = {
  id: 1243,
  name: '高纯氟化钪铒',
  category: '固体',
  description: '高纯度钪铒复合氟化物，用于上转换激光和光学材料',
  density: Infinity,
  color() {
    const r = 224 + Math.floor(Math.random() * 16);
    const g = 230 + Math.floor(Math.random() * 16);
    const b = 238 + Math.floor(Math.random() * 14);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液(9)溶解 0.001
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(HighPurityScandiumErbiumFluoride);
