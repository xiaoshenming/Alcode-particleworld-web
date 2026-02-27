import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 导热膏 —— 高导热性粘稠液体
 * - 液体（粘稠），密度 3.0
 * - 极高导热性：快速在邻居间传导温度（类似石墨烯但是液态）
 * - 不可燃，耐高温（>500° 才分解）
 * - 粘稠流动（比水慢很多）
 * - 银灰色带微微光泽
 */

export const ThermalPaste: MaterialDef = {
  id: 220,
  name: '导热膏',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 银灰色
      const base = 160 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.85) {
      // 浅灰色
      const base = 180 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 1;
      b = base + 3;
    } else {
      // 微光泽
      const base = 190 + Math.floor(Math.random() * 20);
      r = base + 5;
      g = base + 3;
      b = base;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超高温分解
    if (temp > 500) {
      world.set(x, y, 7); // 变烟
      world.wakeArea(x, y);
      return;
    }

    // 高导热性：快速传导温度
    if (temp > 25 || temp < 15) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        const diff = temp - nTemp;
        if (Math.abs(diff) > 3) {
          const transfer = diff * 0.25;
          world.addTemp(nx, ny, transfer);
          world.addTemp(x, y, -transfer);
          world.wakeArea(nx, ny);
        }
      }
    }

    // === 粘稠液体流动（很慢） ===
    if (y >= world.height - 1) return;

    // 缓慢下落
    if (world.isEmpty(x, y + 1) && Math.random() < 0.3) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 3.0 && belowDensity < Infinity && Math.random() < 0.2) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下（很慢）
    if (Math.random() < 0.15) {
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }

    // 极慢水平流动
    if (Math.random() < 0.05) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
      }
    }
  },
};

registerMaterial(ThermalPaste);
