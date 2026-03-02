import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 高纯氟化镱铒 —— 高纯度镱铒复合氟化物
 * - 固体，密度 Infinity
 * - 酸液(9)溶解概率 0.001
 * - 热传导 0.05/0.06
 * - 淡蓝白色晶体
 */

export const HighPurityYtterbiumErbiumFluoride: MaterialDef = {
  id: 1233,
  name: '高纯氟化镱铒',
  category: '固体',
  description: '高纯度镱铒复合氟化物，用于光纤激光器和光通信',
  density: Infinity,
  color() {
    const r = 222 + Math.floor(Math.random() * 16);
    const g = 228 + Math.floor(Math.random() * 16);
    const b = 236 + Math.floor(Math.random() * 14);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    // 4方向显式展开（上下左右，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1;
      const nid = world.get(nx, ny);

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
        }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1;
      const nid = world.get(nx, ny);

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
        }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y;
      const nid = world.get(nx, ny);

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
        }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y;
      const nid = world.get(nx, ny);

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
        }
  },
};

registerMaterial(HighPurityYtterbiumErbiumFluoride);
