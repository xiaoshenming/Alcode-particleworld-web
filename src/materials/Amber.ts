import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 琥珀 —— 远古树脂凝固的化石
 * - 固体，密度无限，不可移动
 * - 透明金黄色外观
 * - 可以"封存"接触到的小粒子（沙、蚂蚁、种子等变为琥珀）
 * - 高温（>300°）可以融化为液态树脂（变为蜂蜜代替）
 * - 酸液可以缓慢腐蚀
 * - 可燃，但燃点较高（>150°）
 */

/** 会被琥珀封存的小粒子 */
const PRESERVABLE = new Set([
  1, 12, 15, 20, 23, 40, 49, 52, // 沙子、种子、雪、泥土、盐、蚂蚁、苔藓、萤火虫
]);

export const Amber: MaterialDef = {
  id: 61,
  name: '琥珀',
  color() {
    // 透明金黄色
    const phase = Math.random();
    let r: number, g: number, b: number, a: number;
    if (phase < 0.5) {
      // 深金色
      r = 200 + Math.floor(Math.random() * 30);
      g = 140 + Math.floor(Math.random() * 30);
      b = 20 + Math.floor(Math.random() * 20);
      a = 0xD0;
    } else if (phase < 0.8) {
      // 浅蜜色
      r = 230 + Math.floor(Math.random() * 25);
      g = 180 + Math.floor(Math.random() * 30);
      b = 50 + Math.floor(Math.random() * 30);
      a = 0xC0;
    } else {
      // 亮点高光
      r = 245 + Math.floor(Math.random() * 10);
      g = 210 + Math.floor(Math.random() * 20);
      b = 100 + Math.floor(Math.random() * 30);
      a = 0xE0;
    }
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化为蜂蜜（液态树脂）
    if (temp > 300) {
      world.set(x, y, 45); // 蜂蜜
      return;
    }

    // 燃点较高，着火变成火+烟
    if (temp > 150) {
      world.set(x, y, Math.random() < 0.5 ? 6 : 7); // 火或烟
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 封存小粒子
      if (PRESERVABLE.has(nid) && Math.random() < 0.05) {
        world.set(nx, ny, 61); // 变为琥珀
        world.markUpdated(nx, ny);
      }

      // 酸液腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        return;
      }

      // 被火点燃（需要持续接触）
      if (nid === 6 && Math.random() < 0.01) {
        world.addTemp(x, y, 30);
      }
    }

    // 缓慢散热
    if (temp > 25) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Amber);
