import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 点燃蜡的热源 */
const WAX_IGNITORS = new Set([6, 11, 28]); // 火、熔岩、火花

/**
 * 蜡 —— 固体，可被火/高温融化为液态蜡
 * - 温度 > 60° → 融化为液态蜡(26)
 * - 接触火/熔岩/火花 → 直接点燃（概率点燃）
 * - 不受重力影响（固体堆叠）
 */
export const Wax: MaterialDef = {
  id: 25,
  name: '蜡',
  color() {
    const r = 240 + Math.floor(Math.random() * 15);
    const g = 220 + Math.floor(Math.random() * 15);
    const b = 170 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 米黄色
  },
  density: Infinity, // 固体不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化为液态蜡
    if (temp > 60) {
      world.set(x, y, 26); // 液态蜡
      world.setTemp(x, y, temp);
      return;
    }

    // 检查邻居：接触火/熔岩/火花点燃（显式4方向，无HOF）
    if (world.inBounds(x, y - 1) && WAX_IGNITORS.has(world.get(x, y - 1)) && Math.random() < 0.03) {
      world.set(x, y, 6); return;
    }
    if (world.inBounds(x, y + 1) && WAX_IGNITORS.has(world.get(x, y + 1)) && Math.random() < 0.03) {
      world.set(x, y, 6); return;
    }
    if (world.inBounds(x - 1, y) && WAX_IGNITORS.has(world.get(x - 1, y)) && Math.random() < 0.03) {
      world.set(x, y, 6); return;
    }
    if (world.inBounds(x + 1, y) && WAX_IGNITORS.has(world.get(x + 1, y)) && Math.random() < 0.03) {
      world.set(x, y, 6); return;
    }
  },
};

registerMaterial(Wax);

registerMaterial(Wax);
