import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 锆石 —— 极耐高温的宝石矿物
 * - 固体，密度 Infinity（不可移动）
 * - 极耐高温（>2500°才分解为干沙146）
 * - 耐酸：遇酸(9)/硫酸(173)不受影响
 * - 透明带彩色闪光，类似钻石但偏暖色
 */

export const Zircon: MaterialDef = {
  id: 174,
  name: '锆石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.3) {
      // 暖白透明基调
      r = 220 + Math.floor(Math.random() * 30);
      g = 210 + Math.floor(Math.random() * 25);
      b = 190 + Math.floor(Math.random() * 20);
    } else if (phase < 0.5) {
      // 金色闪光
      r = 240 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 30);
      b = 120 + Math.floor(Math.random() * 40);
    } else if (phase < 0.7) {
      // 橙红闪光
      r = 235 + Math.floor(Math.random() * 20);
      g = 170 + Math.floor(Math.random() * 35);
      b = 140 + Math.floor(Math.random() * 30);
    } else if (phase < 0.85) {
      // 淡蓝闪光
      r = 190 + Math.floor(Math.random() * 25);
      g = 210 + Math.floor(Math.random() * 25);
      b = 235 + Math.floor(Math.random() * 20);
    } else {
      // 亮白高光（钻石般闪烁）
      r = 245 + Math.floor(Math.random() * 10);
      g = 240 + Math.floor(Math.random() * 10);
      b = 235 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固定不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温分解（>2500°）
    if (temp > 2500 && Math.random() < 0.02) {
      world.set(x, y, 146); // 干沙
      world.wakeArea(x, y);
      return;
    }

    // 闪光效果：偶尔刷新颜色模拟光线折射
    if (Math.random() < 0.03) {
      world.set(x, y, 174);
    }

    // 锆石耐酸，不需要处理酸/硫酸交互
    // 检查邻居只做最基本的唤醒
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇熔岩传导高温
      if (nid === 11) {
        world.addTemp(x, y, 5);
        world.wakeArea(x, y);
      }
    }
  },
};

registerMaterial(Zircon);
