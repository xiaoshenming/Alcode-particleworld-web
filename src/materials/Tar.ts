import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 沥青 —— 黑色高粘度液体
 * - 极高粘度，流动非常缓慢（比蜂蜜更慢）
 * - 可燃：遇火缓慢燃烧，产生大量浓烟
 * - 高温（>80°）软化，流动性增加
 * - 极高温（>200°）自燃
 * - 水无法穿透沥青层（密度高于水）
 * - 冷却后几乎不流动（模拟凝固）
 */

/** 可点燃沥青的材质 */
const IGNITER = new Set([6, 11, 55, 28]); // 火、熔岩、等离子体、火花

export const Tar: MaterialDef = {
  id: 67,
  name: '沥青',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 深黑色
      r = 20 + Math.floor(Math.random() * 15);
      g = 18 + Math.floor(Math.random() * 12);
      b = 15 + Math.floor(Math.random() * 10);
    } else if (phase < 0.85) {
      // 深褐黑色
      r = 35 + Math.floor(Math.random() * 15);
      g = 25 + Math.floor(Math.random() * 10);
      b = 15 + Math.floor(Math.random() * 10);
    } else {
      // 微光泽反射
      r = 45 + Math.floor(Math.random() * 15);
      g = 40 + Math.floor(Math.random() * 10);
      b = 35 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温自燃
    if (temp > 200 && Math.random() < 0.08) {
      world.set(x, y, 6); // 火
      // 产生浓烟
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 7); // 烟
        world.markUpdated(x, y - 1);
      }
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火源燃烧（缓慢）
      if (IGNITER.has(nid) && Math.random() < 0.15) {
        world.set(x, y, 6); // 火
        // 产生浓烟
        if (y > 0 && world.isEmpty(x, y - 1)) {
          world.set(x, y - 1, 7); // 烟
          world.markUpdated(x, y - 1);
        }
        world.wakeArea(x, y);
        return;
      }

      // 酸液缓慢溶解
      if (nid === 9 && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.set(nx, ny, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 粘度：温度越低越粘
    // 低温几乎不动，高温才流动
    let moveChance: number;
    if (temp < 20) {
      moveChance = 0.02; // 常温几乎凝固
    } else if (temp < 80) {
      moveChance = 0.05 + (temp - 20) * 0.003;
    } else {
      moveChance = 0.3 + (temp - 80) * 0.004; // 高温软化
    }
    moveChance = Math.min(moveChance, 0.8);

    if (Math.random() > moveChance) {
      world.wakeArea(x, y); // 保持活跃
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
    if (belowDensity > 0 && belowDensity < 3.5 && belowDensity < Infinity) {
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

    // 水平流动（极缓慢）
    if (Math.random() < 0.3) {
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

registerMaterial(Tar);
