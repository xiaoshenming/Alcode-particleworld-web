import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁声材料 —— 磁场转化为声波的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有电线(44)通电时，使周围粒子振动
 * - 过热 >750° 失效变为石头
 * - 深灰色带银色磁性纹路
 */

export const MagnetoacousticMaterial: MaterialDef = {
  id: 455,
  name: '磁声材料',
  category: '特殊',
  description: '磁场转化为声波的材料，附近电线通电时使周围粒子振动',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.55) {
      // 深灰基底
      r = 65 + Math.floor(Math.random() * 12);
      g = 68 + Math.floor(Math.random() * 10);
      b = 72 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 银色磁性纹路
      r = 170 + Math.floor(Math.random() * 25);
      g = 175 + Math.floor(Math.random() * 20);
      b = 185 + Math.floor(Math.random() * 20);
    } else {
      // 暗蓝色调
      r = 50 + Math.floor(Math.random() * 10);
      g = 55 + Math.floor(Math.random() * 10);
      b = 80 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 750) {
      world.set(x, y, 3);
      world.wakeArea(x, y);
      return;
    }

    // 检测附近是否有通电的电线（温度 > 30 的电线视为通电）
    let powered = false;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) === 44 && world.getTemp(nx, ny) > 30) {
          powered = true;
          break;
        }
      }
      if (powered) break;
    }

    if (powered) {
      // 使周围可移动粒子振动
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          if (nid !== 0 && nid !== 455 && Math.random() < 0.1) {
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

registerMaterial(MagnetoacousticMaterial);
