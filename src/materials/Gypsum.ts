import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 石膏 —— 不可移动的固体
 * - 遇水(2)缓慢软化（极低概率变为泥土20）
 * - 高温(>1200°)分解为干沙(146)
 * - 白色偏灰
 */
export const Gypsum: MaterialDef = {
  id: 168,
  name: '石膏',
  color() {
    const t = Math.floor(Math.random() * 20);
    const r = 220 + t;
    const g = 218 + t;
    const b = 210 + t;
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 白色偏灰
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // 高温分解为干沙
    if (world.getTemp(x, y) > 1200) {
      world.set(x, y, 146); // 干沙
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水缓慢软化
      if (nid === 2 && Math.random() < 0.002) {
        world.set(x, y, 20); // 变为泥土
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Gypsum);
