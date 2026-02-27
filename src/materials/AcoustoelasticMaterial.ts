import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声电弹性材料 —— 声波转化为电能的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 周围有粒子运动时产生电弧效果
 * - 可以给附近的电线(44)充能
 * - 过热 >700° 失效变为石头
 * - 深蓝灰色带金色纹路
 */

export const AcoustoelasticMaterial: MaterialDef = {
  id: 445,
  name: '声电弹性材料',
  category: '特殊',
  description: '声波转化为电能的智能材料，周围有运动粒子时给电线充能',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.55) {
      // 深蓝灰基底
      r = 55 + Math.floor(Math.random() * 12);
      g = 60 + Math.floor(Math.random() * 10);
      b = 85 + Math.floor(Math.random() * 18);
    } else if (phase < 0.8) {
      // 金色纹路
      r = 190 + Math.floor(Math.random() * 25);
      g = 170 + Math.floor(Math.random() * 20);
      b = 70 + Math.floor(Math.random() * 15);
    } else {
      // 暗紫色调
      r = 70 + Math.floor(Math.random() * 15);
      g = 50 + Math.floor(Math.random() * 10);
      b = 95 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过热失效
    if (temp > 700) {
      world.set(x, y, 3); // 石头
      world.wakeArea(x, y);
      return;
    }

    // 检测周围运动粒子
    let activeCount = 0;
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) !== 0) activeCount++;
    }

    // 有活跃邻居时产生电能效果
    if (activeCount >= 2) {
      // 扫描 3 格范围，给电线充能或产生电弧
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);

          // 给电线充能（电线 ID=44）
          if (nid === 44 && Math.random() < 0.06) {
            world.addTemp(nx, ny, 15);
            world.wakeArea(nx, ny);
          }

          // 偶尔在空气中产生电弧（电弧 ID=145）
          if (nid === 0 && Math.random() < 0.008) {
            world.set(nx, ny, 145);
            world.wakeArea(nx, ny);
          }
        }
      }
    }

    // 导热
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

registerMaterial(AcoustoelasticMaterial);
