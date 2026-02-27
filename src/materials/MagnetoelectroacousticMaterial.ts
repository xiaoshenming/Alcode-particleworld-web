import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磁电声材料 —— 磁场转化为电能和声波的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有磁铁(42)时，给附近电线充能并使周围粒子振动
 * - 过热 >780° 失效变为石头
 * - 暗紫灰色带银色磁性纹路
 */

export const MagnetoelectroacousticMaterial: MaterialDef = {
  id: 470,
  name: '磁电声材料',
  category: '特殊',
  description: '磁场同时转化为电能和声波的三效材料，附近有磁铁时充能电线并振动粒子',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.55) {
      // 暗紫灰基底
      r = 68 + Math.floor(Math.random() * 12);
      g = 55 + Math.floor(Math.random() * 10);
      b = 78 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 银色磁性纹路
      r = 165 + Math.floor(Math.random() * 25);
      g = 170 + Math.floor(Math.random() * 20);
      b = 180 + Math.floor(Math.random() * 20);
    } else {
      // 深紫色调
      r = 55 + Math.floor(Math.random() * 10);
      g = 40 + Math.floor(Math.random() * 8);
      b = 65 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 780) {
      world.set(x, y, 3);
      world.wakeArea(x, y);
      return;
    }

    // 检测附近是否有磁铁(42)
    let hasMagnet = false;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) === 42) {
          hasMagnet = true;
          break;
        }
      }
      if (hasMagnet) break;
    }

    if (hasMagnet) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          // 电能效果：给附近电线充能
          if (nid === 44 && Math.random() < 0.12) {
            world.addTemp(nx, ny, 6);
            world.wakeArea(nx, ny);
            continue;
          }

          // 声波效果：振动可移动粒子
          if (nid !== 0 && nid !== 470 && nid !== 42 && nid !== 44 && Math.random() < 0.07) {
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
        }
      }
    }

    // 导热
    const dirs = DIRS4;
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

registerMaterial(MagnetoelectroacousticMaterial);
