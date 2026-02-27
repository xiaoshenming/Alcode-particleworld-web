import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热磁材料 —— 温度敏感的磁性材料
 * - 固体，密度 Infinity（不可移动）
 * - 低温时有磁性（吸引金属粒子）
 * - 高温 >350° 失去磁性（居里温度）
 * - >1500° 熔化为熔岩
 * - 颜色随温度变化：冷=深蓝，热=暗红
 */

export const ThermomagneticMaterial: MaterialDef = {
  id: 430,
  name: '热磁材料',
  category: '特殊',
  description: '温度敏感磁性材料，低温有磁性吸引金属，高温失磁',
  density: Infinity,
  color() {
    // 基础色：深蓝灰（冷态）
    const r = 60 + Math.floor(Math.random() * 20);
    const g = 70 + Math.floor(Math.random() * 15);
    const b = 120 + Math.floor(Math.random() * 25);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1500) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 居里温度以下有磁性，吸引金属粒子
    const isMagnetic = temp < 350;
    const magnetRange = 4;

    // 金属材质ID集合
    const metalIds = new Set([10, 31, 32, 34, 85, 86, 199, 246, 251]);

    const dirs = DIRS4;

    if (isMagnetic) {
      // 搜索范围内的金属粒子并吸引
      for (let dy = -magnetRange; dy <= magnetRange; dy++) {
        for (let dx = -magnetRange; dx <= magnetRange; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          if (metalIds.has(nid) && Math.random() < 0.08) {
            // 向热磁材料方向移动一格
            const mx = dx > 0 ? -1 : dx < 0 ? 1 : 0;
            const my = dy > 0 ? -1 : dy < 0 ? 1 : 0;
            const tx = nx + mx, ty = ny + my;
            if (world.inBounds(tx, ty) && world.get(tx, ty) === 0) {
              world.swap(nx, ny, tx, ty);
              world.wakeArea(tx, ty);
            }
          }
        }
      }

      // 磁性态保持活跃
      world.wakeArea(x, y);
    }

    // 导热
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(ThermomagneticMaterial);
