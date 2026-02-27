import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 辉绿岩变质 —— 辉绿岩经变质作用形成的岩石
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1150° → 熔岩(11)
 * - 耐酸(9)：极缓慢溶解
 * - 低导热(0.03)
 * - 暗绿灰色带白色条纹
 */

export const MetaDiabas: MaterialDef = {
  id: 329,
  name: '变质辉绿岩',
  category: '矿石',
  description: '辉绿岩经变质作用形成的岩石',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 暗绿灰基质
      r = 55 + Math.floor(Math.random() * 15);
      g = 70 + Math.floor(Math.random() * 15);
      b = 60 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 白色条纹
      const base = 150 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 5;
      b = base - 5;
    } else {
      // 深灰绿
      r = 45 + Math.floor(Math.random() * 10);
      g = 55 + Math.floor(Math.random() * 12);
      b = 48 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1150) {
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

      // 极耐酸
      if (nid === 9 && Math.random() < 0.004) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(MetaDiabas);
