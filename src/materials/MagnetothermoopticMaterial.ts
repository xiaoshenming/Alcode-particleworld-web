import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁热光材料 —— 磁场转化为热能和光的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有磁铁(42)或电磁铁(230)时，自身升温并发出光束
 * - 过热 >900° 失效变为石头
 * - 深铁灰色带红色磁力纹路
 */

export const MagnetothermoopticMaterial: MaterialDef = {
  id: 500,
  name: '磁热光材料',
  category: '特殊',
  description: '磁场同时转化为热能和光的三效材料，检测磁场产生热和光',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深铁灰基底
      r = 75 + Math.floor(Math.random() * 12);
      g = 65 + Math.floor(Math.random() * 10);
      b = 62 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 红色磁力纹路
      r = 180 + Math.floor(Math.random() * 20);
      g = 55 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 12);
    } else {
      // 暗铁灰色调
      r = 58 + Math.floor(Math.random() * 8);
      g = 50 + Math.floor(Math.random() * 8);
      b = 48 + Math.floor(Math.random() * 8);
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
      world.addTemp(x, y, 3);

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          // 光效果：在空位生成光束
          if (nid === 0 && Math.random() < 0.025) {
            world.set(nx, ny, 48);
            world.wakeArea(nx, ny);
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

registerMaterial(MagnetothermoopticMaterial);
