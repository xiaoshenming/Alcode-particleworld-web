import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 六氟化硒 —— 无色有毒气体
 * - 气体，密度 0.15
 * - 有毒：接触植物(13)/苔藓(49)/藤蔓(56)使其枯萎（概率0.06）
 * - 接触水(2)分解为毒气(18)（概率0.08）
 * - 高温 >200° 分解为毒气(18)
 * - 向上飘动
 */

const ORGANIC_TARGETS = new Set([13, 49, 56, 69, 140]); // 植物、苔藓、藤蔓、菌丝、海藻

export const SeleniumHexafluoride: MaterialDef = {
  id: 393,
  name: '六氟化硒',
  category: '化学',
  description: '无色有毒气体，强氧化性，接触有机物使其枯萎',
  density: 0.15,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 近乎无色（微黄绿）
      r = 200 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 195 + Math.floor(Math.random() * 15);
    } else {
      // 淡绿白
      r = 215 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 15);
      b = 210 + Math.floor(Math.random() * 12);
    }
    return (0xCC << 24) | (b << 16) | (g << 8) | r; // 半透明
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 200) {
      world.set(x, y, 18); // 毒气
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水分解
      if (nid === 2 && Math.random() < 0.08) {
        world.set(x, y, 18); // 毒气
        world.wakeArea(x, y);
        return;
      }

      // 毒杀有机物
      if (ORGANIC_TARGETS.has(nid) && Math.random() < 0.06) {
        world.set(nx, ny, 0);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动（向上飘动） ===
    if (y > 0 && world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 上方有更重的气体则交换
    if (y > 0) {
      const aboveDensity = world.getDensity(x, y - 1);
      if (aboveDensity > 0.15 && aboveDensity !== Infinity) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
    }

    // 随机横向扩散
    if (Math.random() < 0.5) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 斜上飘动
    if (y > 0 && Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y - 1) && world.isEmpty(x + dir, y - 1)) {
        world.swap(x, y, x + dir, y - 1);
        world.markUpdated(x + dir, y - 1);
        return;
      }
    }
  },
};

registerMaterial(SeleniumHexafluoride);
