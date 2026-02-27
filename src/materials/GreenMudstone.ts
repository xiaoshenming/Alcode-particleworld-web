import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 绿泥片岩 —— 低级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >2200° 熔化为熔岩
 * - 耐酸性较弱
 * - 暗绿色带片状纹理，富含绿泥石
 */

export const GreenMudstone: MaterialDef = {
  id: 459,
  name: '绿泥片岩',
  category: '固体',
  description: '富含绿泥石的低级变质岩，暗绿色片状构造',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 暗绿基底
      r = 35 + Math.floor(Math.random() * 12);
      g = 55 + Math.floor(Math.random() * 18);
      b = 38 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 浅绿片理
      r = 50 + Math.floor(Math.random() * 15);
      g = 75 + Math.floor(Math.random() * 20);
      b = 50 + Math.floor(Math.random() * 12);
    } else {
      // 深色矿物
      r = 28 + Math.floor(Math.random() * 8);
      g = 38 + Math.floor(Math.random() * 10);
      b = 30 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
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

      // 耐酸性较弱
      if (nid === 9 && Math.random() < 0.008) {
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

registerMaterial(GreenMudstone);
