import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电声材料 —— 电能转化为声波的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有电线(44)通电时，产生冲击波推开周围粒子
 * - 过热 >800° 失效变为石头
 * - 深蓝灰色带铜色电路纹路
 */

export const ElectroacousticMaterial: MaterialDef = {
  id: 460,
  name: '电声材料',
  category: '特殊',
  description: '电能转化为声波的材料，附近电线通电时产生冲击波推开粒子',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.55) {
      // 深蓝灰基底
      r = 55 + Math.floor(Math.random() * 10);
      g = 60 + Math.floor(Math.random() * 10);
      b = 78 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 铜色电路纹路
      r = 180 + Math.floor(Math.random() * 25);
      g = 130 + Math.floor(Math.random() * 20);
      b = 70 + Math.floor(Math.random() * 15);
    } else {
      // 暗蓝色调
      r = 42 + Math.floor(Math.random() * 10);
      g = 48 + Math.floor(Math.random() * 10);
      b = 68 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 800) {
      world.set(x, y, 3);
      world.wakeArea(x, y);
      return;
    }

    // 检测附近通电电线
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
      // 冲击波：向外推开粒子
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          if (nid !== 0 && nid !== 460 && nid !== 44 && Math.random() < 0.08) {
            const nDensity = world.getDensity(nx, ny);
            if (nDensity < Infinity) {
              // 沿远离中心方向推
              const pushDx = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
              const pushDy = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
              const tx = nx + pushDx, ty = ny + pushDy;
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

registerMaterial(ElectroacousticMaterial);
