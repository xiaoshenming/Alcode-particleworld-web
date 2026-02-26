import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 三氯化硼 —— 无色有毒气体
 * - 气体，密度 -0.3（向上飘）
 * - 遇水(2)反应 → 酸液(9)
 * - 有毒：杀灭生物
 * - 无色微白
 */

const TOXIC_TARGETS = new Set([40, 52, 49, 70, 93, 100, 156]);

export const BoronTrichloride: MaterialDef = {
  id: 378,
  name: '三氯化硼',
  category: '气体',
  description: '无色有毒气体，遇水强烈反应生成盐酸和硼酸',
  density: -0.3,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 近无色微白
      r = 220 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 18);
      b = 230 + Math.floor(Math.random() * 15);
    } else {
      // 淡灰
      r = 205 + Math.floor(Math.random() * 18);
      g = 210 + Math.floor(Math.random() * 16);
      b = 215 + Math.floor(Math.random() * 14);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    // 自然消散
    if (Math.random() < 0.003) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水反应 → 酸液
      if (nid === 2 && Math.random() < 0.15) {
        world.set(nx, ny, 9); // 酸液
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 8); // 蒸汽
        world.markUpdated(x, y);
        world.wakeArea(x, y);
        return;
      }

      // 毒杀生物
      if (TOXIC_TARGETS.has(nid) && Math.random() < 0.06) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动 ===
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.25) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    if (y > 0 && Math.random() < 0.12) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y - 1) && world.isEmpty(x + dir, y - 1)) {
        world.swap(x, y, x + dir, y - 1);
        world.markUpdated(x + dir, y - 1);
        return;
      }
    }
  },
};

registerMaterial(BoronTrichloride);
