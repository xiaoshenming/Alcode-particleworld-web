import type { MaterialDef, WorldAPI } from './types';
import { DIRS4 } from './types';
import { registerMaterial } from './registry';

/**
 * 蜡 —— 固体，可被火/高温融化为液态蜡
 * - 温度 > 60° → 融化为液态蜡(26)
 * - 接触火 → 直接点燃
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

    // 检查邻居：火直接点燃
    for (const [dx, dy] of DIRS4) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 6 && Math.random() < 0.03) {
        world.set(x, y, 6); // 着火
        return;
      }
    }
  },
};

registerMaterial(Wax);
