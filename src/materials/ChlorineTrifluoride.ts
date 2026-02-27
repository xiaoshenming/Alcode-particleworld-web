import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 三氟化氯 —— 极强氧化性气体/液体
 * - 液体，密度 1.77
 * - 极强氧化性：接触木(4)/植物(13)/煤炭(46)直接点燃（概率0.15）
 * - 接触水(2)剧烈反应产生毒气(18)和热量
 * - 接触金属(10)腐蚀为铁锈(72)
 * - 高温 >100° 蒸发为毒气(18)
 * - 淡黄绿色液体
 */

const FLAMMABLE = new Set([4, 13, 22, 46, 134, 56, 69]); // 木、植物、火药、煤炭、干草、藤蔓、菌丝
const METAL_TARGETS = new Set([10, 85, 86, 44]); // 金属、铜、锡、电线

export const ChlorineTrifluoride: MaterialDef = {
  id: 398,
  name: '三氟化氯',
  category: '化学',
  description: '极强氧化剂，能点燃几乎所有物质，包括水和玻璃',
  density: 1.77,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 淡黄绿
      r = 200 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 15);
      b = 130 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗黄绿
      r = 180 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 12);
      b = 110 + Math.floor(Math.random() * 15);
    } else {
      // 亮绿白
      r = 215 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 12);
      b = 155 + Math.floor(Math.random() * 15);
    }
    return (0xEE << 24) | (b << 16) | (g << 8) | r; // 微透明
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发
    if (temp > 100) {
      world.set(x, y, 18); // 毒气
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 点燃可燃物
      if (FLAMMABLE.has(nid) && Math.random() < 0.15) {
        world.set(nx, ny, 6); // 火
        world.wakeArea(nx, ny);
        // 自身消耗
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 接触水剧烈反应
      if (nid === 2 && Math.random() < 0.12) {
        world.set(nx, ny, 18); // 毒气
        world.set(x, y, 0);
        world.addTemp(nx, ny, 120);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 腐蚀金属
      if (METAL_TARGETS.has(nid) && Math.random() < 0.01) {
        world.set(nx, ny, 72); // 铁锈
        world.wakeArea(nx, ny);
      }

      // 腐蚀玻璃（三氟化氯的特性）
      if (nid === 17 && Math.random() < 0.008) {
        world.set(nx, ny, 0);
        world.wakeArea(nx, ny);
      }
    }

    // === 液体运动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 1.77) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    if (Math.random() < 0.5) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    if (y < world.height - 1) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(ChlorineTrifluoride);
