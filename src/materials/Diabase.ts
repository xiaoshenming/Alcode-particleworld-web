import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 辉绿岩 —— 基性侵入岩
 * - 固体，密度 Infinity（不可移动）
 * - 深灰绿色，致密坚硬
 * - 高温(>1100°)熔化为熔岩
 * - 中等耐酸
 * - 低导热
 */

export const Diabase: MaterialDef = {
  id: 274,
  name: '辉绿岩',
  category: '矿石',
  description: '基性侵入岩，深灰绿色，致密坚硬',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰绿
      r = 50 + Math.floor(Math.random() * 15);
      g = 60 + Math.floor(Math.random() * 20);
      b = 55 + Math.floor(Math.random() * 15);
    } else if (phase < 0.7) {
      // 暗绿灰
      r = 40 + Math.floor(Math.random() * 20);
      g = 55 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 15);
    } else if (phase < 0.9) {
      // 深灰
      const base = 45 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 5;
      b = base + 2;
    } else {
      // 浅色斑晶
      const base = 90 + Math.floor(Math.random() * 25);
      r = base - 5;
      g = base + 5;
      b = base;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1100) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸腐蚀（中等耐酸）
      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸
      if ((nid === 173 || nid === 183) && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 低导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Diabase);
