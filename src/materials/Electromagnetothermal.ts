import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电磁热材料 —— 电能转化为磁效应和热的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有电线(44)或电弧(145)时，产生磁力并升温
 * - 过热 >900° 失效变为石头
 * - 深铜色带电弧蓝纹
 */

export const Electromagnetothermal: MaterialDef = {
  id: 520,
  name: '电磁热材料',
  category: '特殊',
  description: '电能同时转化为磁效应和热的三效材料，通电时产生磁力和热',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 140 + Math.floor(Math.random() * 15);
      g = 85 + Math.floor(Math.random() * 12);
      b = 55 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 80 + Math.floor(Math.random() * 15);
      g = 100 + Math.floor(Math.random() * 15);
      b = 180 + Math.floor(Math.random() * 20);
    } else {
      r = 115 + Math.floor(Math.random() * 10);
      g = 70 + Math.floor(Math.random() * 8);
      b = 45 + Math.floor(Math.random() * 8);
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

    // 检测附近是否有电源（电线、电弧）
    let hasElectric = false;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if ((nid === 44 || nid === 145) && Math.random() < 0.25) {
          hasElectric = true;
          break;
        }
      }
      if (hasElectric) break;
    }

    if (hasElectric) {
      // 热效果：自身升温
      world.addTemp(x, y, 3);

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
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
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

registerMaterial(Electromagnetothermal);
