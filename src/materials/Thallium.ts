import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铊 —— 剧毒重金属，柔软易切割
 * - 固体，密度 Infinity（不可移动）
 * - 低熔点：>304° → 液态铊(307)
 * - 剧毒：接触水(2) → 污染为毒液(19)
 * - 接触酸(9)缓慢溶解
 * - 中等导热(0.06)
 * - 银灰色，暴露空气后表面氧化变暗
 */

export const Thallium: MaterialDef = {
  id: 306,
  name: '铊',
  category: '金属',
  description: '剧毒重金属，柔软易切割',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰
      const base = 155 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.8) {
      // 氧化暗灰
      const base = 110 + Math.floor(Math.random() * 15);
      r = base + 5;
      g = base;
      b = base - 3;
    } else {
      // 高光
      const base = 185 + Math.floor(Math.random() * 20);
      r = base;
      g = base;
      b = base + 8;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低熔点
    if (temp > 304) {
      world.set(x, y, 307);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 剧毒：污染水
      if (nid === 2 && Math.random() < 0.08) {
        world.set(nx, ny, 19); // 毒液
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 酸溶解
      if (nid === 9 && Math.random() < 0.015) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Thallium);
