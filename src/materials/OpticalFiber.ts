import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光纤 —— 传导光束的透明纤维
 * - 固体，密度 Infinity（不可移动）
 * - 光传导：接收邻近激光(47)/光束(48)并向对侧传递
 *   - 检测四邻是否有光束/激光
 *   - 在对侧空位生成光束(48)
 * - 高温(>800°)熔化为液态玻璃(92)
 * - 透明带微蓝色
 */

export const OpticalFiber: MaterialDef = {
  id: 240,
  name: '光纤',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 透明微蓝
      r = 180 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 25);
      b = 235 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 淡白透明
      r = 210 + Math.floor(Math.random() * 25);
      g = 220 + Math.floor(Math.random() * 20);
      b = 240 + Math.floor(Math.random() * 15);
    } else {
      // 折射高光
      r = 230 + Math.floor(Math.random() * 25);
      g = 240 + Math.floor(Math.random() * 15);
      b = 250 + Math.floor(Math.random() * 5);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 800) {
      world.set(x, y, 92); // 液态玻璃
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 光传导：检测四邻光源并向对侧传递
    const pairs: [number, number, number, number][] = [
      [0, -1, 0, 1],   // 上→下
      [0, 1, 0, -1],   // 下→上
      [-1, 0, 1, 0],   // 左→右
      [1, 0, -1, 0],   // 右→左
    ];

    for (const [sx, sy, tx, ty] of pairs) {
      const srcX = x + sx, srcY = y + sy;
      const tgtX = x + tx, tgtY = y + ty;

      if (!world.inBounds(srcX, srcY) || !world.inBounds(tgtX, tgtY)) continue;

      const srcId = world.get(srcX, srcY);
      // 检测光源
      if ((srcId === 47 || srcId === 48) && Math.random() < 0.5) {
        const tgtId = world.get(tgtX, tgtY);
        if (tgtId === 0) {
          world.set(tgtX, tgtY, 48); // 光束
          world.markUpdated(tgtX, tgtY);
          world.wakeArea(tgtX, tgtY);
        }
      }
    }
  },
};

registerMaterial(OpticalFiber);
