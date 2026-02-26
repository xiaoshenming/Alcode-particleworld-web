import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热光声材料 —— 热能转化为光和声波的三效材料
 * - 固体，密度 Infinity（不可移动）
 * - 自身温度 >200° 时，发出光束并激发周围粒子振动
 * - 过热 >1200° 失效变为熔岩
 * - 深橙红色带金色热纹路
 */

export const ThermooptoacousticMaterial: MaterialDef = {
  id: 495,
  name: '热光声材料',
  category: '特殊',
  description: '热能同时转化为光和声波的三效材料，高温时产生光和振动',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深橙红基底
      r = 145 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 12);
      b = 25 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 金色热纹路
      r = 210 + Math.floor(Math.random() * 20);
      g = 170 + Math.floor(Math.random() * 18);
      b = 45 + Math.floor(Math.random() * 15);
    } else {
      // 暗橙红色调
      r = 115 + Math.floor(Math.random() * 10);
      g = 40 + Math.floor(Math.random() * 8);
      b = 18 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1200) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 高温时产生光和声波效果
    if (temp > 200) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          // 光效果：在空位生成光束
          if (nid === 0 && Math.random() < 0.02) {
            world.set(nx, ny, 48);
            world.wakeArea(nx, ny);
            continue;
          }

          // 声波效果：推动附近非固体粒子
          if (nid !== 0 && nid !== 495 && nid !== 44 && nid !== 48) {
            const nDensity = world.getDensity(nx, ny);
            if (nDensity < Infinity && Math.random() < 0.03) {
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

registerMaterial(ThermooptoacousticMaterial);
