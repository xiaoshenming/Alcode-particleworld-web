import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 碳纤维 —— 高强度复合材料
 * - 固体，中等密度，不可移动
 * - 极高强度：不被爆炸破坏
 * - 导电：与电线(44)交互
 * - 耐高温：>3000°才分解
 * - 耐酸：不被酸(9)腐蚀
 * - 视觉上呈黑色编织纹理
 */

export const CarbonFiber: MaterialDef = {
  id: 152,
  name: '碳纤维',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      r = 20 + Math.floor(Math.random() * 10);
      g = 22 + Math.floor(Math.random() * 10);
      b = 25 + Math.floor(Math.random() * 10);
    } else if (t < 0.7) {
      // 编织纹理亮线
      r = 35 + Math.floor(Math.random() * 15);
      g = 38 + Math.floor(Math.random() * 15);
      b = 42 + Math.floor(Math.random() * 15);
    } else {
      r = 12 + Math.floor(Math.random() * 8);
      g = 14 + Math.floor(Math.random() * 8);
      b = 18 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温分解
    if (temp > 3000 && Math.random() < 0.003) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    // 导热
    if (temp > 25) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 5 && Math.random() < 0.12) {
          world.addTemp(x, y, -1);
          world.addTemp(nx, ny, 1);
        }
      }
    }
  },
};

registerMaterial(CarbonFiber);
