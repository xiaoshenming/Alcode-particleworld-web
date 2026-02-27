import type { MaterialDef, WorldAPI } from './types';
import { DIRS4 } from './types';
import { registerMaterial } from './registry';

/**
 * 泥砖 —— 棕红色固体建筑材料
 * - 不可移动
 * - 遇水(2)缓慢软化为泥土(20)
 * - 遇酸(9)缓慢腐蚀
 */
export const MudBrick: MaterialDef = {
  id: 164,
  name: '泥砖',
  color() {
    // 棕红色砖块
    const r = 160 + Math.floor(Math.random() * 20);
    const g = 80 + Math.floor(Math.random() * 15);
    const b = 50 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    for (const [dx, dy] of DIRS4) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水缓慢软化为泥土
      if (nid === 2 && Math.random() < 0.008) {
        world.set(x, y, 20); // 泥土
        return;
      }

      // 遇酸缓慢腐蚀
      if (nid === 9 && Math.random() < 0.015) {
        world.set(x, y, 0); // 消失
        return;
      }
    }
  },
};

registerMaterial(MudBrick);
