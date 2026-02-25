import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铋 —— 彩虹色金属晶体
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>271°)熔化为液态铋(182)
 * - 遇酸(9)/硫酸(173)缓慢溶解
 * - 彩虹色金属晶体：颜色随时间变化呈现彩虹渐变（粉/蓝/绿/金）
 * - 需要 wakeArea 保持活跃以维持视觉效果
 */

/** 全局帧计数器，用于彩虹色相位计算 */
let frameCount = 0;
setInterval(() => { frameCount++; }, 50);

export const Bismuth: MaterialDef = {
  id: 181,
  name: '铋',
  color() {
    // 彩虹渐变：基于帧计数 + 随机偏移产生粉/蓝/绿/金循环
    const phase = (frameCount * 0.03 + Math.random() * 2) % 4;
    let r: number, g: number, b: number;

    if (phase < 1) {
      // 粉紫色
      r = 200 + Math.floor(Math.random() * 40);
      g = 100 + Math.floor(Math.random() * 40);
      b = 180 + Math.floor(Math.random() * 40);
    } else if (phase < 2) {
      // 蓝色
      r = 80 + Math.floor(Math.random() * 40);
      g = 140 + Math.floor(Math.random() * 40);
      b = 220 + Math.floor(Math.random() * 35);
    } else if (phase < 3) {
      // 绿色
      r = 80 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 40);
      b = 140 + Math.floor(Math.random() * 40);
    } else {
      // 金色
      r = 220 + Math.floor(Math.random() * 30);
      g = 180 + Math.floor(Math.random() * 40);
      b = 60 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为液态铋
    if (temp > 271) {
      world.set(x, y, 182); // 液态铋
      world.setTemp(x, y, 280);
      world.wakeArea(x, y);
      return;
    }

    // 刷新颜色（彩虹闪烁效果）
    world.set(x, y, 181);

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸液缓慢溶解
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇硫酸缓慢溶解
      if (nid === 173 && Math.random() < 0.012) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 保持活跃以维持彩虹视觉效果
    world.wakeArea(x, y);
  },
};

registerMaterial(Bismuth);
