import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光声磁材料(3) —— 光-声-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 光照同时产生声波和磁效应
 * - 深紫褐色调
 */

export const PhotoAcoustoMagneticMaterial3: MaterialDef = {
  id: 1245,
  name: '光声磁材料(3)',
  category: '固体',
  description: '光-声-磁三场耦合材料，光照同时产生声波和磁效应',
  density: Infinity,
  color() {
    const r = 132 + Math.floor(Math.random() * 20);
    const g = 108 + Math.floor(Math.random() * 20);
    const b = 138 + Math.floor(Math.random() * 22);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 酸液腐蚀
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液(9)溶解
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 检测光照
    let hasLight = false;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      // 光束(48)、激光(47)、等离子体(55)
      if (nid === 48 || nid === 47 || nid === 55) {
        hasLight = true;
        break;
      }
    }

    if (hasLight && Math.random() < 0.04) {
      // 同时产生声效应（生成龙卷风碎片）
      const ay = y - 1;
      if (world.inBounds(x, ay) && world.get(x, ay) === 0) {
        world.set(x, ay, 50);
        world.wakeArea(x, ay);
      }

      // 同时产生磁效应（吸引附近金属粒子）
      for (let rx = -2; rx <= 2; rx++) {
        for (let ry = -2; ry <= 2; ry++) {
          if (rx === 0 && ry === 0) continue;
          const mx = x + rx, my = y + ry;
          if (!world.inBounds(mx, my)) continue;
          const mid = world.get(mx, my);
          // 金属类材质：金属(10)、铜(85)、锡(86)、磁铁(42)
          if ((mid === 10 || mid === 85 || mid === 86 || mid === 42) && Math.random() < 0.1) {
            const toX = mx + (mx > x ? -1 : mx < x ? 1 : 0);
            const toY = my + (my > y ? -1 : my < y ? 1 : 0);
            if (world.inBounds(toX, toY) && world.get(toX, toY) === 0) {
              world.swap(mx, my, toX, toY);
              world.wakeArea(toX, toY);
            }
          }
        }
      }
    }

    // 热传导
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(PhotoAcoustoMagneticMaterial3);
