import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 绿泥石片麻岩 —— 含绿泥石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1080° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 暗绿色带绿泥石条纹纹理
 */

export const ChloriteGneiss: MaterialDef = {
  id: 719,
  name: '绿泥石片麻岩',
  category: '固体',
  description: '含绿泥石矿物的片麻岩，属于低级变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 88 + Math.floor(Math.random() * 12);
      g = 118 + Math.floor(Math.random() * 10);
      b = 95 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 100 + Math.floor(Math.random() * 10);
      g = 132 + Math.floor(Math.random() * 10);
      b = 108 + Math.floor(Math.random() * 10);
    } else {
      r = 78 + Math.floor(Math.random() * 10);
      g = 108 + Math.floor(Math.random() * 10);
      b = 85 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1080) {
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

      if (nid === 9 && Math.random() < 0.004) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(ChloriteGneiss);
