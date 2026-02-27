import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 超导体 —— 零电阻材料
 * - 固体，密度 Infinity（不可移动）
 * - 超导电：完美传导电能，增强邻近电线(44)
 * - 超导热：极快热传导
 * - 临界温度：温度超过 -196°（77K）失去超导性
 *   （简化：温度 > 50° 失去超导性）
 * - 迈斯纳效应：排斥磁性材质（磁沙147、磁流体96）
 * - 深蓝黑色带冷光
 */

/** 磁性材质 */
const MAGNETIC = new Set([147, 96]); // 磁沙、磁流体

export const Superconductor: MaterialDef = {
  id: 250,
  name: '超导体',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深蓝黑
      r = 20 + Math.floor(Math.random() * 15);
      g = 30 + Math.floor(Math.random() * 15);
      b = 60 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 暗蓝
      r = 15 + Math.floor(Math.random() * 10);
      g = 25 + Math.floor(Math.random() * 15);
      b = 50 + Math.floor(Math.random() * 20);
    } else {
      // 冷光闪烁
      r = 60 + Math.floor(Math.random() * 30);
      g = 80 + Math.floor(Math.random() * 40);
      b = 140 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const isSuperconducting = temp < 50;

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (isSuperconducting) {
        // 超导电：增强电线
        if (nid === 44) {
          world.addTemp(nx, ny, 5);
          world.wakeArea(nx, ny);
        }

        // 迈斯纳效应：排斥磁性材质
        if (MAGNETIC.has(nid) && Math.random() < 0.15) {
          // 将磁性材质推离
          const pushX = nx + dx, pushY = ny + dy;
          if (world.inBounds(pushX, pushY) && world.isEmpty(pushX, pushY)) {
            world.swap(nx, ny, pushX, pushY);
            world.markUpdated(pushX, pushY);
            world.wakeArea(pushX, pushY);
          }
        }
      }

      // 超导热（无论是否超导态都有良好导热）
      if (nid !== 0 && Math.random() < 0.25) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 2) {
          const avg = (temp + nt) / 2;
          world.setTemp(x, y, avg);
          world.setTemp(nx, ny, avg);
        }
      }
    }

    // 超导态时持续唤醒
    if (isSuperconducting && Math.random() < 0.2) {
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(Superconductor);
