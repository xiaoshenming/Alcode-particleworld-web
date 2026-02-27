import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声光电材料 —— 声波转化为光和电能的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有振动粒子时，发出光束并给电线充能
 * - 过热 >900° 失效变为石头
 * - 深紫铜色带银色声波纹路
 */

export const AcoustooptoelectricMaterial: MaterialDef = {
  id: 490,
  name: '声光电材料',
  category: '特殊',
  description: '声波同时转化为光和电能的三效材料，检测粒子运动产生光和电能',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深紫铜基底
      r = 115 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 10);
      b = 75 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 银色声波纹路
      r = 182 + Math.floor(Math.random() * 18);
      g = 188 + Math.floor(Math.random() * 16);
      b = 192 + Math.floor(Math.random() * 14);
    } else {
      // 暗紫铜色调
      r = 90 + Math.floor(Math.random() * 10);
      g = 42 + Math.floor(Math.random() * 8);
      b = 58 + Math.floor(Math.random() * 8);
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

    // 检测附近是否有运动中的粒子
    let hasMotion = false;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if (nid !== 0 && nid !== 490 && nid !== 44) {
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

          // 光效果：在空位生成光束
          if (nid === 0 && Math.random() < 0.025) {
            world.set(nx, ny, 48);
            world.wakeArea(nx, ny);
            continue;
          }

          // 电能效果：给附近电线充能
          if (nid === 44 && Math.random() < 0.1) {
            world.addTemp(nx, ny, 5);
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

registerMaterial(AcoustooptoelectricMaterial);
