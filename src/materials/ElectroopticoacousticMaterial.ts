import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电光声材料 —— 电能转化为光和声波的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 附近有电线充能时，发出光束并激发周围粒子运动
 * - 过热 >900° 失效变为石头
 * - 深靛蓝色带金色电路纹路
 */

export const ElectroopticoacousticMaterial: MaterialDef = {
  id: 480,
  name: '电光声材料',
  category: '特殊',
  description: '电能同时转化为光和声波的三效材料，检测电线充能产生光和振动',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深靛蓝基底
      r = 35 + Math.floor(Math.random() * 12);
      g = 45 + Math.floor(Math.random() * 10);
      b = 110 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 金色电路纹路
      r = 200 + Math.floor(Math.random() * 20);
      g = 175 + Math.floor(Math.random() * 18);
      b = 50 + Math.floor(Math.random() * 15);
    } else {
      // 暗靛蓝色调
      r = 25 + Math.floor(Math.random() * 8);
      g = 32 + Math.floor(Math.random() * 8);
      b = 85 + Math.floor(Math.random() * 12);
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

    // 检测附近是否有充能电线
    let hasEnergy = false;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if (nid === 44) {
          const nt = world.getTemp(nx, ny);
          if (nt > 10 && Math.random() < 0.3) {
            hasEnergy = true;
            break;
          }
        }
      }
      if (hasEnergy) break;
    }

    if (hasEnergy) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          // 光效果：在空位生成光束
          if (nid === 0 && Math.random() < 0.03) {
            world.set(nx, ny, 48);
            world.wakeArea(nx, ny);
            continue;
          }

          // 声波效果：推动附近非固体粒子
          if (nid !== 0 && nid !== 480 && nid !== 44) {
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

registerMaterial(ElectroopticoacousticMaterial);
