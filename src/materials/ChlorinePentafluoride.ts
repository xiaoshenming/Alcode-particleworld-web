import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 五氟化氯 —— 强氧化性气体
 * - 气体，密度 -1.0（上浮）
 * - 极强氧化性：接触可燃物直接点燃
 * - 接触水剧烈反应产生毒气和热量
 * - 接触金属缓慢腐蚀
 * - 高温 >200° 分解为毒气
 * - 无色微黄气体
 */

const FLAMMABLE = new Set([4, 13, 22, 46, 134, 172]); // 木、植物、火药、煤炭、干草、干藤

export const ChlorinePentafluoride: MaterialDef = {
  id: 403,
  name: '五氟化氯',
  category: '化学',
  description: '极强氧化性气体，比三氟化氯更活泼，能氧化几乎所有物质',
  density: -1.0,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 微黄透明
      r = 220 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 15);
      b = 180 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 淡黄
      r = 200 + Math.floor(Math.random() * 15);
      g = 210 + Math.floor(Math.random() * 12);
      b = 160 + Math.floor(Math.random() * 15);
    } else {
      // 近白
      r = 235 + Math.floor(Math.random() * 15);
      g = 240 + Math.floor(Math.random() * 10);
      b = 210 + Math.floor(Math.random() * 15);
    }
    return (0xBB << 24) | (b << 16) | (g << 8) | r; // 半透明
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 200) {
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
      if (FLAMMABLE.has(nid) && Math.random() < 0.18) {
        world.set(nx, ny, 6);
        world.set(x, y, 0);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 接触水剧烈反应
      if (nid === 2 && Math.random() < 0.15) {
        world.set(nx, ny, 18);
        world.set(x, y, 0);
        world.addTemp(nx, ny, 150);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 腐蚀金属
      if (nid === 10 && Math.random() < 0.008) {
        world.set(nx, ny, 72);
        world.wakeArea(nx, ny);
      }

      // 腐蚀玻璃
      if (nid === 17 && Math.random() < 0.01) {
        world.set(nx, ny, 0);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动（上浮） ===
    if (y > 0) {
      const above = world.get(x, y - 1);
      if (above === 0) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
      const aDensity = world.getDensity(x, y - 1);
      if (aDensity > 0) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
    }

    // 随机横向扩散
    if (Math.random() < 0.6) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 缓慢消散
    if (Math.random() < 0.001) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(ChlorinePentafluoride);
