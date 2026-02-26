import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 辉绿岩 —— 深色侵入岩
 * - 固体，密度 Infinity（不可移动）
 * - 极耐高温（>2500° 才熔化为熔岩）
 * - 耐酸性好（概率0.002）
 * - 深灰绿色，细粒结构
 */

export const Diabase: MaterialDef = {
  id: 439,
  name: '辉绿岩',
  category: '固体',
  description: '深色侵入岩，由辉石和斜长石组成，常用作建筑石材',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 50 + Math.floor(Math.random() * 15);
      g = 60 + Math.floor(Math.random() * 15);
      b = 50 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 40 + Math.floor(Math.random() * 12);
      g = 55 + Math.floor(Math.random() * 15);
      b = 42 + Math.floor(Math.random() * 10);
    } else {
      r = 75 + Math.floor(Math.random() * 15);
      g = 80 + Math.floor(Math.random() * 12);
      b = 72 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2500) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.002) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Diabase);
