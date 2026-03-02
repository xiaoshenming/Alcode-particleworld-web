import type { MaterialDef, WorldAPI } from './types';
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
    // 遇水/酸反应（显式4方向，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nid = world.get(x, y - 1);
      if (nid === 2 && Math.random() < 0.008) { world.set(x, y, 20); return; }
      if (nid === 9 && Math.random() < 0.015) { world.set(x, y, 0); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nid = world.get(x, y + 1);
      if (nid === 2 && Math.random() < 0.008) { world.set(x, y, 20); return; }
      if (nid === 9 && Math.random() < 0.015) { world.set(x, y, 0); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nid = world.get(x - 1, y);
      if (nid === 2 && Math.random() < 0.008) { world.set(x, y, 20); return; }
      if (nid === 9 && Math.random() < 0.015) { world.set(x, y, 0); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nid = world.get(x + 1, y);
      if (nid === 2 && Math.random() < 0.008) { world.set(x, y, 20); return; }
      if (nid === 9 && Math.random() < 0.015) { world.set(x, y, 0); return; }
    }
  },
};

registerMaterial(MudBrick);
