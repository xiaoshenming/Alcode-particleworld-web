import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 黑曜石 —— 熔岩急速冷却形成的火山玻璃
 * - 极坚硬，密度无限，不可移动
 * - 比石头更耐高温（需要 >800° 才能重新融化为熔岩）
 * - 雷电/等离子体无法破坏（比水晶更硬）
 * - 酸液无法腐蚀
 * - 深黑色带紫色/绿色光泽
 */

export const Obsidian: MaterialDef = {
  id: 60,
  name: '黑曜石',
  color() {
    // 深黑色带微弱紫/绿光泽
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 纯黑
      r = 15 + Math.floor(Math.random() * 15);
      g = 15 + Math.floor(Math.random() * 15);
      b = 18 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 紫色光泽
      r = 30 + Math.floor(Math.random() * 20);
      g = 10 + Math.floor(Math.random() * 10);
      b = 40 + Math.floor(Math.random() * 25);
    } else {
      // 绿色光泽
      r = 10 + Math.floor(Math.random() * 10);
      g = 25 + Math.floor(Math.random() * 20);
      b = 20 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温才能重新融化（>800°）
    if (temp > 800) {
      world.set(x, y, 11); // 熔岩
      return;
    }

    // 黑曜石几乎不需要更新，非常稳定
    // 只做温度传导
    if (temp > 30) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        // 缓慢散热
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 5) {
          world.addTemp(nx, ny, 1);
          world.addTemp(x, y, -1);
        }
      }
    }
  },
};

registerMaterial(Obsidian);
