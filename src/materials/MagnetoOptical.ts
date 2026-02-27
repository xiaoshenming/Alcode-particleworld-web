import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磁光材料 —— 在磁场中改变光学性质的特殊材料
 * - 固体，密度 Infinity（不可移动）
 * - 接近磁铁(42)/电磁铁(230)/钕(371)时发光变色
 * - 高温 >1500° → 熔岩(11)
 * - 紫蓝色基底，受磁场影响时闪烁
 */

/** 磁源材质 */
const MAGNET_SOURCES = new Set([42, 230, 371]); // 磁铁、电磁铁、钕

export const MagnetoOptical: MaterialDef = {
  id: 375,
  name: '磁光材料',
  category: '特殊',
  description: '在磁场中改变光学性质的功能材料，用于光隔离器和磁光存储',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 紫蓝色
      r = 80 + Math.floor(Math.random() * 20);
      g = 50 + Math.floor(Math.random() * 15);
      b = 160 + Math.floor(Math.random() * 25);
    } else if (phase < 0.7) {
      // 深紫
      r = 100 + Math.floor(Math.random() * 18);
      g = 40 + Math.floor(Math.random() * 12);
      b = 140 + Math.floor(Math.random() * 20);
    } else {
      // 亮蓝紫高光
      r = 120 + Math.floor(Math.random() * 25);
      g = 70 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1500) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检测附近磁源，受磁场影响时发光
    let nearMagnet = false;
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (MAGNET_SOURCES.has(world.get(nx, ny))) {
          nearMagnet = true;
          break;
        }
      }
      if (nearMagnet) break;
    }

    if (nearMagnet) {
      // 受磁场影响：闪烁发光，重新设置自身刷新颜色
      if (Math.random() < 0.3) {
        world.set(x, y, 375); // 重设自身以刷新颜色
        world.wakeArea(x, y);
      }

      // 有概率向周围空格发出光束(48)
      if (Math.random() < 0.02) {
        const dirs = DIRS4;
        const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
          world.set(nx, ny, 48); // 光束
          world.wakeArea(nx, ny);
        }
      }
    }

    // 耐酸
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(MagnetoOptical);
