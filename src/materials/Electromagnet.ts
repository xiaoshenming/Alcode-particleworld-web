import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 电磁铁 —— 通电时产生磁力的铁芯
 * - 固体，密度 Infinity（不可移动）
 * - 磁力效果：吸引周围 3 格内的金属粉末/沙子向自身移动
 *   - 吸引：磁沙(147)、铁锈(72)、沙金(103)、磁流体(96)
 * - 遇电线(44)通电时磁力增强（吸引范围更大）
 * - 高温(>770°)失去磁性（居里温度）
 * - 深灰色带红色线圈纹理
 */

/** 可被吸引的磁性材质 */
const MAGNETIC = new Set([147, 72, 103, 96]); // 磁沙、铁锈、沙金、磁流体

export const Electromagnet: MaterialDef = {
  id: 230,
  name: '电磁铁',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深灰色铁芯
      const base = 80 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.8) {
      // 红色线圈
      r = 160 + Math.floor(Math.random() * 40);
      g = 50 + Math.floor(Math.random() * 25);
      b = 40 + Math.floor(Math.random() * 20);
    } else {
      // 铜色线圈
      r = 180 + Math.floor(Math.random() * 30);
      g = 120 + Math.floor(Math.random() * 30);
      b = 50 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超过居里温度失去磁性
    if (temp > 770) return;

    world.wakeArea(x, y);

    // 检查是否邻近电线（增强磁力）
    let powered = false;
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 44) {
        powered = true;
        break;
      }
    }

    const range = powered ? 5 : 3;

    // 吸引范围内的磁性材质
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        if (MAGNETIC.has(nid) && Math.random() < 0.06) {
          // 计算向电磁铁方向移动一步
          const moveX = dx > 0 ? -1 : dx < 0 ? 1 : 0;
          const moveY = dy > 0 ? -1 : dy < 0 ? 1 : 0;
          const tx = nx + moveX, ty = ny + moveY;

          if (world.inBounds(tx, ty) && world.isEmpty(tx, ty)) {
            world.swap(nx, ny, tx, ty);
            world.markUpdated(tx, ty);
            world.wakeArea(tx, ty);
          }
        }
      }
    }
  },
};

registerMaterial(Electromagnet);
