import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 二氧化硫 —— 刺激性有毒气体
 * - 气体，密度 0.5（比空气略重）
 * - 遇水生成酸液(9)（亚硫酸）
 * - 有毒：杀灭生物材质
 * - 遇火/高温氧化消散
 * - 还原性：可被臭氧(228)氧化
 * - 无色微黄
 */

/** 可被SO2毒杀的生物 */
const TOXIC_TARGETS = new Set([40, 49, 52, 70, 93, 100, 156]); // 蚂蚁、苔藓、萤火虫、菌丝、孢子、蘑菇、水草

export const SulfurDioxide: MaterialDef = {
  id: 243,
  name: '二氧化硫',
  color() {
    // 无色微黄
    const base = 210 + Math.floor(Math.random() * 30);
    const r = base;
    const g = base - 5;
    const b = base - 20 + Math.floor(Math.random() * 10);
    const a = 0x70 + Math.floor(Math.random() * 0x30);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.5,
  update(x: number, y: number, world: WorldAPI) {
    // 自然消散
    if (Math.random() < 0.005) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水生成酸液
      if (nid === 2 && Math.random() < 0.06) {
        world.set(nx, ny, 9); // 酸液
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 0);
        return;
      }

      // 遇火/高温氧化消散
      if ((nid === 6 || nid === 28 || nid === 55) && Math.random() < 0.2) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 被臭氧氧化
      if (nid === 228 && Math.random() < 0.1) {
        world.set(x, y, 0);
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 毒杀生物
      if (TOXIC_TARGETS.has(nid) && Math.random() < 0.04) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动（略重于空气，倾向下沉扩散） ===
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.15) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 横向扩散
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 偶尔上升
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.1) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(SulfurDioxide);
