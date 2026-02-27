import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 声电光材料 —— 声波转化为电能和光的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有振动粒子（密度<Infinity且在移动）时，给电线充能并发光
 * - 过热 >900° 失效变为石头
 * - 深琥珀色带银色声波纹路
 */

export const AcoustoelectroopticMaterial: MaterialDef = {
  id: 475,
  name: '声电光材料',
  category: '特殊',
  description: '声波同时转化为电能和光的三效材料，检测周围粒子运动产生电能和光',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深琥珀基底
      r = 120 + Math.floor(Math.random() * 15);
      g = 75 + Math.floor(Math.random() * 12);
      b = 30 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 银色声波纹路
      r = 180 + Math.floor(Math.random() * 20);
      g = 185 + Math.floor(Math.random() * 18);
      b = 190 + Math.floor(Math.random() * 15);
    } else {
      // 暗琥珀色调
      r = 95 + Math.floor(Math.random() * 10);
      g = 58 + Math.floor(Math.random() * 8);
      b = 22 + Math.floor(Math.random() * 8);
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

    // 检测附近是否有运动中的粒子（非空、非固体）
    let hasMotion = false;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if (nid !== 0 && nid !== 475 && nid !== 44) {
          const nDensity = world.getDensity(nx, ny);
          if (nDensity < Infinity && Math.random() < 0.3) {
            hasMotion = true;
            break;
          }
        }
      }
      if (hasMotion) break;
    }

    if (hasMotion) {
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

          // 光效果：在空位生成短暂光束
          if (nid === 0 && Math.random() < 0.02) {
            world.set(nx, ny, 48);
            world.wakeArea(nx, ny);
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

registerMaterial(AcoustoelectroopticMaterial);
