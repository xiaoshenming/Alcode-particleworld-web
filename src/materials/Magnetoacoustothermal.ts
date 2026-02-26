import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁声热材料 —— 磁场转化为声波和热的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有磁铁(42)或电磁铁(230)时，产生振动（推动粒子）并升温
 * - 过热 >900° 失效变为石头
 * - 暗钢灰色带磁力紫纹
 */

export const Magnetoacoustothermal: MaterialDef = {
  id: 525,
  name: '磁声热材料',
  category: '特殊',
  description: '磁场同时转化为声波和热的三效材料，检测磁场产生振动和热',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 78 + Math.floor(Math.random() * 12);
      g = 75 + Math.floor(Math.random() * 10);
      b = 82 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 110 + Math.floor(Math.random() * 15);
      g = 70 + Math.floor(Math.random() * 12);
      b = 135 + Math.floor(Math.random() * 15);
    } else {
      r = 60 + Math.floor(Math.random() * 8);
      g = 58 + Math.floor(Math.random() * 8);
      b = 65 + Math.floor(Math.random() * 8);
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

    // 检测附近是否有磁铁或电磁铁
    let hasMagnet = false;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if ((nid === 42 || nid === 230) && Math.random() < 0.25) {
          hasMagnet = true;
          break;
        }
      }
      if (hasMagnet) break;
    }

    if (hasMagnet) {
      // 热效果：自身升温
      world.addTemp(x, y, 2.5);

      // 声波效果：推动附近轻质粒子
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          if (nid !== 0 && nid !== 42 && nid !== 230 && Math.random() < 0.015) {
            const nd = world.getDensity(nx, ny);
            if (nd < 5 && nd !== Infinity) {
              const px = nx + dx, py = ny + dy;
              if (world.inBounds(px, py) && world.get(px, py) === 0) {
                world.swap(nx, ny, px, py);
                world.wakeArea(px, py);
              }
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

registerMaterial(Magnetoacoustothermal);
