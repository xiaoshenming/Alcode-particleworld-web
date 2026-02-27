import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 千枚岩 —— 低级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 耐高温（>2000° 才熔化为熔岩(11)）
 * - 耐酸(9)中等
 * - 银灰色带丝绢光泽
 */

export const Phyllite: MaterialDef = {
  id: 344,
  name: '千枚岩',
  category: '矿石',
  description: '低级变质岩，具有丝绢光泽',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银灰色
      r = 145 + Math.floor(Math.random() * 20);
      g = 150 + Math.floor(Math.random() * 20);
      b = 155 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 暗灰绿
      r = 120 + Math.floor(Math.random() * 15);
      g = 130 + Math.floor(Math.random() * 15);
      b = 125 + Math.floor(Math.random() * 15);
    } else {
      // 丝绢高光
      r = 175 + Math.floor(Math.random() * 25);
      g = 180 + Math.floor(Math.random() * 25);
      b = 185 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 2000) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸中等
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Phyllite);
