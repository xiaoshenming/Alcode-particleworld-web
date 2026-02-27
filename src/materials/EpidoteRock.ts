import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 绿帘石岩 —— 中低级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >2300° 熔化为熔岩
 * - 耐酸性中等
 * - 黄绿色带柱状纹理，富含绿帘石
 */

export const EpidoteRock: MaterialDef = {
  id: 464,
  name: '绿帘石岩',
  category: '固体',
  description: '富含绿帘石的中低级变质岩，黄绿色柱状构造',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 黄绿基底
      r = 75 + Math.floor(Math.random() * 15);
      g = 85 + Math.floor(Math.random() * 18);
      b = 35 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 浅黄绿柱状
      r = 95 + Math.floor(Math.random() * 18);
      g = 110 + Math.floor(Math.random() * 20);
      b = 45 + Math.floor(Math.random() * 12);
    } else {
      // 深色基质
      r = 55 + Math.floor(Math.random() * 10);
      g = 60 + Math.floor(Math.random() * 12);
      b = 30 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2300) {
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

      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.03) {
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

registerMaterial(EpidoteRock);
