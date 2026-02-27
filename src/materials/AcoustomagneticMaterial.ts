import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 声磁材料 —— 声波产生磁场的特殊材料
 * - 固体，密度 Infinity（不可移动）
 * - 周围有粒子运动（swap活跃）时产生磁力效果
 * - 吸引附近金属粒子（铁、铜等）
 * - 过热 >600° 失效变为普通石头
 * - 深灰色带银色条纹
 */

export const AcoustomagneticMaterial: MaterialDef = {
  id: 440,
  name: '声磁材料',
  category: '特殊',
  description: '声波激活磁场的材料，周围有运动粒子时吸引金属',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 深灰基底
      r = 70 + Math.floor(Math.random() * 15);
      g = 72 + Math.floor(Math.random() * 12);
      b = 78 + Math.floor(Math.random() * 15);
    } else if (phase < 0.85) {
      // 银色条纹
      r = 160 + Math.floor(Math.random() * 20);
      g = 165 + Math.floor(Math.random() * 15);
      b = 175 + Math.floor(Math.random() * 15);
    } else {
      // 暗蓝色调
      r = 55 + Math.floor(Math.random() * 10);
      g = 58 + Math.floor(Math.random() * 10);
      b = 90 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过热失效
    if (temp > 600) {
      world.set(x, y, 3); // 石头
      world.wakeArea(x, y);
      return;
    }

    // 金属材质 ID 集合（铁、铜等常见金属）
    const metalIds = new Set([10, 15, 16, 72, 426, 431, 436]);

    // 检测周围是否有运动（活跃粒子）
    let activeNeighbors = 0;
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) !== 0) activeNeighbors++;
    }

    // 有活跃邻居时产生磁力效果
    if (activeNeighbors >= 1) {
      // 扫描 3 格范围内的金属粒子并吸引
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          if (metalIds.has(nid) && Math.random() < 0.04) {
            // 向声磁材料方向移动一格
            const mx = nx + (dx > 0 ? -1 : dx < 0 ? 1 : 0);
            const my = ny + (dy > 0 ? -1 : dy < 0 ? 1 : 0);
            if (world.inBounds(mx, my) && world.get(mx, my) === 0) {
              world.swap(nx, ny, mx, my);
              world.wakeArea(mx, my);
            }
          }
        }
      }
    }

    // 导热
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(AcoustomagneticMaterial);
