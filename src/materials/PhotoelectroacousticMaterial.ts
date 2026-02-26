import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光电声材料 —— 光能转化为电能和声波的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有光束(48)时，给电线充能并激发周围粒子振动
 * - 过热 >900° 失效变为石头
 * - 深翠绿色带银色光路纹理
 */

export const PhotoelectroacousticMaterial: MaterialDef = {
  id: 485,
  name: '光电声材料',
  category: '特殊',
  description: '光能同时转化为电能和声波的三效材料，检测光束产生电能和振动',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深翠绿基底
      r = 20 + Math.floor(Math.random() * 10);
      g = 95 + Math.floor(Math.random() * 15);
      b = 65 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 银色光路纹理
      r = 185 + Math.floor(Math.random() * 18);
      g = 190 + Math.floor(Math.random() * 16);
      b = 195 + Math.floor(Math.random() * 14);
    } else {
      // 暗翠绿色调
      r = 15 + Math.floor(Math.random() * 8);
      g = 72 + Math.floor(Math.random() * 10);
      b = 50 + Math.floor(Math.random() * 8);
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

    // 检测附近是否有光束
    let hasLight = false;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) === 48 && Math.random() < 0.3) {
          hasLight = true;
          break;
        }
      }
      if (hasLight) break;
    }

    if (hasLight) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          // 电能效果：给附近电线充能
          if (nid === 44 && Math.random() < 0.1) {
            world.addTemp(nx, ny, 5);
            world.wakeArea(nx, ny);
            continue;
          }

          // 声波效果：推动附近非固体粒子
          if (nid !== 0 && nid !== 485 && nid !== 44 && nid !== 48) {
            const nDensity = world.getDensity(nx, ny);
            if (nDensity < Infinity && Math.random() < 0.04) {
              world.addTemp(nx, ny, 2);
              world.wakeArea(nx, ny);
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

registerMaterial(PhotoelectroacousticMaterial);
