import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 碳化硅 —— 超硬耐高温陶瓷材料
 * - 固体，极高密度，不可移动
 * - 耐高温：温度>2700°才会分解为烟(7)
 * - 耐酸：不被酸液(9)腐蚀
 * - 导热性好：向邻居传递温度
 * - 视觉上呈深灰带蓝绿光泽
 */

export const SiliconCarbide: MaterialDef = {
  id: 136,
  name: '碳化硅',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 55 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 15);
      b = 70 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 45 + Math.floor(Math.random() * 10);
      g = 55 + Math.floor(Math.random() * 10);
      b = 65 + Math.floor(Math.random() * 10);
    } else {
      // 蓝绿光泽
      r = 60 + Math.floor(Math.random() * 10);
      g = 80 + Math.floor(Math.random() * 15);
      b = 85 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温分解
    if (temp > 2700) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 导热：向邻居均匀传递温度
    if (temp > 25) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 5 && Math.random() < 0.15) {
          world.addTemp(x, y, -1);
          world.addTemp(nx, ny, 1);
        }
      }
    }
  },
};

registerMaterial(SiliconCarbide);
