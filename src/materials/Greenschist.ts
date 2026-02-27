import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 绿片岩 —— 低级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>1500° → 熔岩(11)
 * - 耐酸(9)
 * - 绿灰色带纹理
 */

export const Greenschist: MaterialDef = {
  id: 364,
  name: '绿片岩',
  category: '矿石',
  description: '低级变质岩，含绿泥石和绿帘石',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 绿灰
      r = 85 + Math.floor(Math.random() * 15);
      g = 115 + Math.floor(Math.random() * 18);
      b = 80 + Math.floor(Math.random() * 12);
    } else if (phase < 0.7) {
      // 深绿灰
      r = 70 + Math.floor(Math.random() * 12);
      g = 100 + Math.floor(Math.random() * 15);
      b = 68 + Math.floor(Math.random() * 10);
    } else if (phase < 0.9) {
      // 暗灰绿
      r = 78 + Math.floor(Math.random() * 10);
      g = 92 + Math.floor(Math.random() * 12);
      b = 75 + Math.floor(Math.random() * 10);
    } else {
      // 浅绿高光
      r = 105 + Math.floor(Math.random() * 18);
      g = 135 + Math.floor(Math.random() * 20);
      b = 98 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 1500) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Greenschist);
