import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热声材料 —— 热量转化为声波振动的特殊材料
 * - 固体，密度 Infinity（不可移动）
 * - 温度越高，周围粒子振动越剧烈（随机位移）
 * - 过热 >800° 失效变为石头
 * - 暗红色带橙色纹路
 */

export const ThermoacousticMaterial: MaterialDef = {
  id: 450,
  name: '热声材料',
  category: '特殊',
  description: '热量转化为声波振动的材料，高温时使周围粒子剧烈振动',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.55) {
      // 暗红基底
      r = 120 + Math.floor(Math.random() * 20);
      g = 40 + Math.floor(Math.random() * 12);
      b = 35 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 橙色纹路
      r = 200 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 20);
      b = 40 + Math.floor(Math.random() * 15);
    } else {
      // 深棕色调
      r = 85 + Math.floor(Math.random() * 15);
      g = 45 + Math.floor(Math.random() * 10);
      b = 30 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过热失效
    if (temp > 800) {
      world.set(x, y, 3); // 石头
      world.wakeArea(x, y);
      return;
    }

    // 温度越高，振动效果越强
    const intensity = Math.max(0, (temp - 20) / 200); // 20°以上开始有效果
    if (intensity <= 0) {
      // 低温时只导热
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
      return;
    }

    // 扫描 2 格范围，使可移动粒子随机振动
    const vibProb = Math.min(0.15, intensity * 0.05);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        if (nid !== 0 && nid !== 450 && Math.random() < vibProb) {
          const nDensity = world.getDensity(nx, ny);
          if (nDensity < Infinity) {
            // 随机方向位移
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

    // 导热
    const dirs = DIRS4;
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

registerMaterial(ThermoacousticMaterial);
