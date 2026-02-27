import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光磁热材料 —— 光能转化为磁效应和热的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有光束(48)或激光(47)时，产生磁力并升温
 * - 过热 >900° 失效变为石头
 * - 浅金色带银白光泽
 */

export const Photomagnetothermal: MaterialDef = {
  id: 510,
  name: '光磁热材料',
  category: '特殊',
  description: '光能同时转化为磁效应和热的三效材料，光照时产生磁力和热',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 195 + Math.floor(Math.random() * 15);
      g = 180 + Math.floor(Math.random() * 12);
      b = 120 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 220 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 15);
      b = 170 + Math.floor(Math.random() * 15);
    } else {
      r = 170 + Math.floor(Math.random() * 12);
      g = 158 + Math.floor(Math.random() * 10);
      b = 100 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 900) {
      world.set(x, y, 3);
      world.wakeArea(x, y);
      return;
    }

    // 检测附近是否有光束或激光
    let hasLight = false;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if ((nid === 47 || nid === 48) && Math.random() < 0.25) {
          hasLight = true;
          break;
        }
      }
      if (hasLight) break;
    }

    if (hasLight) {
      // 热效果：自身升温
      world.addTemp(x, y, 2.5);

      // 磁力效果：吸引附近金属粒子
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          if ((nid === 10 || nid === 85 || nid === 86) && Math.random() < 0.02) {
            const mx = dx > 0 ? nx - 1 : dx < 0 ? nx + 1 : nx;
            const my = dy > 0 ? ny - 1 : dy < 0 ? ny + 1 : ny;
            if (world.inBounds(mx, my) && world.get(mx, my) === 0) {
              world.swap(nx, ny, mx, my);
              world.wakeArea(mx, my);
            }
          }
        }
      }
    }

    // 导热
    const dirs = DIRS4;
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

registerMaterial(Photomagnetothermal);
