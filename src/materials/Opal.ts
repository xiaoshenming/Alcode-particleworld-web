import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛋白石 —— 含水二氧化硅宝石
 * - 固体，高密度，不可移动
 * - 彩虹色变效果（随时间/角度变色）
 * - 高温(>400°)脱水开裂变为干沙(146)
 * - 遇酸(9)不受影响
 * - 视觉上呈乳白色带彩虹光泽
 */

export const Opal: MaterialDef = {
  id: 160,
  name: '蛋白石',
  color() {
    const phase = (Date.now() * 0.002 + Math.random() * 2) % 6;
    let r: number, g: number, b: number;
    const base = 200;
    if (phase < 1) {
      r = base + 40; g = base + 20; b = base + 30;
    } else if (phase < 2) {
      r = base + 20; g = base + 40; b = base + 25;
    } else if (phase < 3) {
      r = base + 25; g = base + 25; b = base + 45;
    } else if (phase < 4) {
      r = base + 45; g = base + 30; b = base + 20;
    } else if (phase < 5) {
      r = base + 30; g = base + 45; b = base + 35;
    } else {
      r = base + 35; g = base + 35; b = base + 40;
    }
    r = Math.min(255, r + Math.floor(Math.random() * 10));
    g = Math.min(255, g + Math.floor(Math.random() * 10));
    b = Math.min(255, b + Math.floor(Math.random() * 10));
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温脱水开裂
    if (temp > 400 && Math.random() < 0.005) {
      world.set(x, y, 146); // 干沙
      world.wakeArea(x, y);
      return;
    }

    // 保持活跃以刷新彩虹色
    world.wakeArea(x, y);
  },
};

registerMaterial(Opal);
