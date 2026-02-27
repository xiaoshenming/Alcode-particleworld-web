import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 六氟化钨 —— 无色有毒气体
 * - 气体，密度 -0.2（较重气体，缓慢上升）
 * - 遇水(2)反应 → 氟化氢(208) + 钨沉淀(199)
 * - 有毒：杀灭生物
 * - 无色微黄
 */

const TOXIC_TARGETS = new Set([40, 52, 49, 70, 93, 100, 156]);

export const TungstenHexafluoride: MaterialDef = {
  id: 373,
  name: '六氟化钨',
  category: '气体',
  description: '无色有毒气体，遇水分解生成氟化氢和钨',
  density: -0.2,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 近无色微黄
      r = 225 + Math.floor(Math.random() * 18);
      g = 222 + Math.floor(Math.random() * 16);
      b = 210 + Math.floor(Math.random() * 12);
    } else {
      // 淡灰黄
      r = 210 + Math.floor(Math.random() * 20);
      g = 208 + Math.floor(Math.random() * 16);
      b = 195 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    // 自然消散
    if (Math.random() < 0.002) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水反应 → 氟化氢 + 钨
      if (nid === 2 && Math.random() < 0.1) {
        world.set(nx, ny, 208); // 氟化氢
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 自身变为钨沉淀
        world.set(x, y, 199); // 钨
        world.markUpdated(x, y);
        world.wakeArea(x, y);
        return;
      }

      // 毒杀生物
      if (TOXIC_TARGETS.has(nid) && Math.random() < 0.05) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动（较重气体，缓慢上升） ===
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.2) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 横向扩散
    if (Math.random() < 0.35) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 斜上扩散
    if (y > 0 && Math.random() < 0.1) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y - 1) && world.isEmpty(x + dir, y - 1)) {
        world.swap(x, y, x + dir, y - 1);
        world.markUpdated(x + dir, y - 1);
        return;
      }
    }
  },
};

registerMaterial(TungstenHexafluoride);
