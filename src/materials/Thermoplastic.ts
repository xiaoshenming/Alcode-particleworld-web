import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热塑性塑料 —— 可加热软化再成型的塑料
 * - 固体，密度 Infinity（常温不可移动）
 * - 加热(>200°)软化为液态流动（密度变为 1.5）
 * - 冷却(<150°)重新固化
 * - 可燃：>300° 着火，产生毒气(18)和烟(7)
 * - 耐酸：大多数酸无效
 * - 多种颜色（随机）
 */

/** 软化状态追踪 */
const softened = new Set<string>();

function key(x: number, y: number): string {
  return `${x},${y}`;
}

export const Thermoplastic: MaterialDef = {
  id: 215,
  name: '热塑性塑料',
  color() {
    // 随机鲜艳颜色
    const hue = Math.floor(Math.random() * 6);
    let r: number, g: number, b: number;
    switch (hue) {
      case 0: // 红
        r = 200 + Math.floor(Math.random() * 40);
        g = 50 + Math.floor(Math.random() * 30);
        b = 50 + Math.floor(Math.random() * 30);
        break;
      case 1: // 蓝
        r = 40 + Math.floor(Math.random() * 30);
        g = 80 + Math.floor(Math.random() * 40);
        b = 190 + Math.floor(Math.random() * 50);
        break;
      case 2: // 绿
        r = 50 + Math.floor(Math.random() * 30);
        g = 170 + Math.floor(Math.random() * 50);
        b = 60 + Math.floor(Math.random() * 30);
        break;
      case 3: // 黄
        r = 220 + Math.floor(Math.random() * 30);
        g = 200 + Math.floor(Math.random() * 40);
        b = 40 + Math.floor(Math.random() * 30);
        break;
      case 4: // 白
        r = 220 + Math.floor(Math.random() * 30);
        g = 218 + Math.floor(Math.random() * 30);
        b = 215 + Math.floor(Math.random() * 30);
        break;
      default: // 橙
        r = 230 + Math.floor(Math.random() * 20);
        g = 130 + Math.floor(Math.random() * 40);
        b = 30 + Math.floor(Math.random() * 30);
        break;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const k = key(x, y);
    const isSoft = softened.has(k);

    // 着火：>300° 燃烧
    if (temp > 300) {
      softened.delete(k);
      // 产生毒气或烟
      if (Math.random() < 0.5) {
        world.set(x, y, 18); // 毒气
      } else {
        world.set(x, y, 7); // 烟
      }
      world.wakeArea(x, y);
      return;
    }

    // 软化：>200°
    if (temp > 200 && !isSoft) {
      softened.add(k);
      world.wakeArea(x, y);
    }

    // 冷却固化：<150°
    if (temp < 150 && isSoft) {
      softened.delete(k);
    }

    // 软化状态下可以流动
    if (isSoft) {
      world.wakeArea(x, y);

      // 检查邻居：遇火着火
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) === 6 && Math.random() < 0.1) {
          softened.delete(k);
          world.set(x, y, 6);
          world.wakeArea(x, y);
          return;
        }
      }

      // 液体流动
      if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.4) {
        softened.delete(k);
        world.swap(x, y, x, y + 1);
        softened.add(key(x, y + 1));
        world.markUpdated(x, y + 1);
        return;
      }

      // 斜下
      if (y < world.height - 1 && Math.random() < 0.3) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        for (const d of [dir, -dir]) {
          const nx = x + d;
          if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
            softened.delete(k);
            world.swap(x, y, nx, y + 1);
            softened.add(key(nx, y + 1));
            world.markUpdated(nx, y + 1);
            return;
          }
        }
      }

      // 水平流动
      if (Math.random() < 0.15) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
          softened.delete(k);
          world.swap(x, y, x + dir, y);
          softened.add(key(x + dir, y));
          world.markUpdated(x + dir, y);
        }
      }
      return;
    }

    // 固态：检查邻居
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火着火
      if (nid === 6 && Math.random() < 0.05) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Thermoplastic);
