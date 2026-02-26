import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光声电材料 —— 光能转化为声波和电能的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有激光(47)/光束(48)时，产生振动并给附近电线充能
 * - 过热 >850° 失效变为石头
 * - 深青色带金色光路纹理
 */

export const PhotoacoustoelectricMaterial: MaterialDef = {
  id: 465,
  name: '光声电材料',
  category: '特殊',
  description: '光能同时转化为声波和电能的三效材料，附近有光源时振动并充能电线',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深青基底
      r = 30 + Math.floor(Math.random() * 10);
      g = 75 + Math.floor(Math.random() * 15);
      b = 85 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 金色光路纹理
      r = 200 + Math.floor(Math.random() * 25);
      g = 175 + Math.floor(Math.random() * 20);
      b = 60 + Math.floor(Math.random() * 15);
    } else {
      // 暗青色调
      r = 22 + Math.floor(Math.random() * 8);
      g = 58 + Math.floor(Math.random() * 10);
      b = 72 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 850) {
      world.set(x, y, 3);
      world.wakeArea(x, y);
      return;
    }

    // 检测附近是否有光源（激光47或光束48）
    let hasLight = false;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if (nid === 47 || nid === 48) {
          hasLight = true;
          break;
        }
      }
      if (hasLight) break;
    }

    if (hasLight) {
      // 声波效果：振动周围可移动粒子
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          if (nid !== 0 && nid !== 465 && nid !== 47 && nid !== 48 && nid !== 44 && Math.random() < 0.06) {
            const nDensity = world.getDensity(nx, ny);
            if (nDensity < Infinity) {
              const rdx = Math.floor(Math.random() * 3) - 1;
              const rdy = Math.floor(Math.random() * 3) - 1;
              const tx = nx + rdx, ty = ny + rdy;
              if (world.inBounds(tx, ty) && world.isEmpty(tx, ty)) {
                world.swap(nx, ny, tx, ty);
                world.wakeArea(tx, ty);
              }
            }
          }

          // 电能效果：给附近电线充能
          if (nid === 44 && Math.random() < 0.15) {
            world.addTemp(nx, ny, 8);
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

registerMaterial(PhotoacoustoelectricMaterial);
