import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 高纯氟化镥铒 —— 高纯度镥铒复合氟化物
 * - 固体，密度无穷大（不移动）
 * - 遇酸液(9)极缓慢溶解
 * - 热传导0.05/0.06
 * - 淡银白色晶体
 */

export const HighPurityLutetiumErbiumFluoride: MaterialDef = {
  id: 1238,
  name: '高纯氟化镥铒',
  category: '固体',
  description: '高纯度镥铒复合氟化物，用于高能激光和光学晶体',
  density: Infinity,
  color() {
    const r = 232 + Math.floor(Math.random() * 16);
    const g = 234 + Math.floor(Math.random() * 16);
    const b = 238 + Math.floor(Math.random() * 14);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液(9)极缓慢溶解
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(HighPurityLutetiumErbiumFluoride);
