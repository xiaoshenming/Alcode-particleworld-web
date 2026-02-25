import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钒 —— 高强度过渡金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 1910°C → 变为液态钒(242)
 * - 极高硬度：耐大多数酸，仅氟化氢(208)和硝酸(183)可缓慢腐蚀
 * - 良好导热性
 * - 银灰色金属光泽
 */

export const Vanadium: MaterialDef = {
  id: 241,
  name: '钒',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰色
      const base = 160 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 3;
      b = base + 8;
    } else if (phase < 0.8) {
      // 深银灰
      const base = 140 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 2;
      b = base + 6;
    } else {
      // 金属高光
      const base = 185 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 5;
      b = base + 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 1910) {
      world.set(x, y, 242); // 液态钒
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

      // 氟化氢/硝酸可腐蚀
      if ((nid === 208 || nid === 183) && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.12) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const avg = (temp + nt) / 2;
          world.setTemp(x, y, avg);
          world.setTemp(nx, ny, avg);
        }
      }
    }
  },
};

registerMaterial(Vanadium);
