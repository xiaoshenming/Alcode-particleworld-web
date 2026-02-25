import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 树脂 —— 粘稠的天然液体
 * - 高粘度，流动比蜂蜜稍快
 * - 遇火燃烧，产生浓烟
 * - 高温（>120°）硬化为琥珀（模拟热固化）
 * - 接触木头/植物时有小概率自然渗出（粘附）
 * - 酸液可溶解
 * - 密度介于水和蜂蜜之间
 */

/** 可点燃树脂的材质 */
const IGNITER = new Set([6, 11, 55, 28]); // 火、熔岩、等离子体、火花

/** 木质材质（树脂会粘附） */
const WOOD_LIKE = new Set([4, 13, 57]); // 木头、植物、藤蔓

export const Resin: MaterialDef = {
  id: 71,
  name: '树脂',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深琥珀色
      r = 180 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 20);
      b = 10 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 浅金黄色
      r = 210 + Math.floor(Math.random() * 20);
      g = 155 + Math.floor(Math.random() * 25);
      b = 30 + Math.floor(Math.random() * 20);
    } else {
      // 亮泽高光
      r = 235 + Math.floor(Math.random() * 15);
      g = 185 + Math.floor(Math.random() * 20);
      b = 50 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温热固化 → 琥珀
    if (temp > 120) {
      world.set(x, y, 61); // 琥珀
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火源燃烧
      if (IGNITER.has(nid) && Math.random() < 0.2) {
        world.set(x, y, 6); // 火
        if (y > 0 && world.isEmpty(x, y - 1)) {
          world.set(x, y - 1, 7); // 烟
          world.markUpdated(x, y - 1);
        }
        world.wakeArea(x, y);
        return;
      }

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.08) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 接触木质材质时粘附（停止流动）
      if (WOOD_LIKE.has(nid) && Math.random() < 0.15) {
        world.wakeArea(x, y);
        return; // 粘住不动
      }
    }

    // 粘度控制：常温下约 40% 概率移动
    const moveChance = Math.min(0.7, 0.4 + (temp - 20) * 0.004);
    if (Math.random() > moveChance) {
      world.wakeArea(x, y);
      return;
    }

    if (y >= world.height - 1) return;

    // 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 2.5 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 水平流动（缓慢）
    if (Math.random() < 0.35) {
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
      }
    }
  },
};

registerMaterial(Resin);
