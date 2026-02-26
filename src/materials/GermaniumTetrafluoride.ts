import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 四氟化锗 —— 无色刺激性气体
 * - 气体，密度 -0.5（向上飘）
 * - 接触水(2)水解生成酸液(9)
 * - 高温 >500° 分解消失
 * - 用于半导体工业
 */

export const GermaniumTetrafluoride: MaterialDef = {
  id: 383,
  name: '四氟化锗',
  category: '气体',
  description: '无色气体，有刺激性，用于半导体工业',
  density: -0.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 近无色微白
      r = 218 + Math.floor(Math.random() * 20);
      g = 222 + Math.floor(Math.random() * 18);
      b = 228 + Math.floor(Math.random() * 15);
    } else {
      // 淡灰微蓝
      r = 200 + Math.floor(Math.random() * 18);
      g = 208 + Math.floor(Math.random() * 16);
      b = 218 + Math.floor(Math.random() * 14);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解消失
    if (temp > 500) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 自然消散
    if (Math.random() < 0.002) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水水解 → 酸液
      if (nid === 2 && Math.random() < 0.1) {
        world.set(nx, ny, 9); // 酸液
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 8); // 蒸汽
        world.markUpdated(x, y);
        world.wakeArea(x, y);
        return;
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

registerMaterial(GermaniumTetrafluoride);
