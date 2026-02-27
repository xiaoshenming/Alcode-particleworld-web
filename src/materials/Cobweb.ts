import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛛丝 —— 粘性网状结构
 * - 固定不动，密度无限
 * - 捕获经过的粒子：沙子、水等穿过时被减速/停住
 * - 可燃，火烧后迅速消失
 * - 水可以缓慢溶解蛛丝
 * - 蚂蚁可以吃掉蛛丝
 * - 半透明白色丝状外观
 */

/** 会被蛛丝捕获（转化为静止）的粒子 */
const CAPTURABLE = new Set([
  1, 2, 5, 15, 20, 21, 23, 24, 45, 54, 56, // 沙、水、油、雪、泥土、黏土、盐、盐水、蜂蜜、沼泽、水银
]);

export const Cobweb: MaterialDef = {
  id: 59,
  name: '蛛丝',
  color() {
    // 半透明白色丝状
    const v = 200 + Math.floor(Math.random() * 40);
    const r = v;
    const g = v;
    const b = v + Math.floor(Math.random() * 15);
    // 半透明：alpha 约 180
    return (0xB4 << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温燃烧（蛛丝非常易燃）
    if (temp > 50) {
      world.set(x, y, 0); // 直接消失
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 被火点燃
      if (nid === 6) {
        world.set(x, y, 6); // 变成火
        return;
      }

      // 蚂蚁吃掉蛛丝
      if (nid === 40 && Math.random() < 0.1) {
        world.set(x, y, 0);
        return;
      }

      // 水缓慢溶解
      if (nid === 2 && Math.random() < 0.005) {
        world.set(x, y, 0);
        return;
      }

      // 酸液快速溶解
      if (nid === 9) {
        world.set(x, y, 0);
        return;
      }

      // 捕获经过的粒子：将其减速（有概率让粒子停住）
      if (CAPTURABLE.has(nid) && Math.random() < 0.3) {
        // 不移动粒子，只是唤醒区域让它看起来被粘住
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(Cobweb);
