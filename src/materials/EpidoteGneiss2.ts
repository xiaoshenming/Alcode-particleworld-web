import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 绿帘石片麻岩(2) —— 富含绿帘石的片麻岩变种
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1040° → 熔岩(11)
 * - 耐酸腐蚀
 * - 黄绿色带柱状结构
 */

export const EpidoteGneiss2: MaterialDef = {
  id: 819,
  name: '绿帘石片麻岩(2)',
  category: '固体',
  description: '富含绿帘石的片麻岩变种，呈黄绿色带柱状结构',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 138 + Math.floor(Math.random() * 20);
      g = 152 + Math.floor(Math.random() * 20);
      b = 108 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 148 + Math.floor(Math.random() * 10);
      g = 162 + Math.floor(Math.random() * 10);
      b = 118 + Math.floor(Math.random() * 10);
    } else {
      r = 138 + Math.floor(Math.random() * 8);
      g = 152 + Math.floor(Math.random() * 8);
      b = 108 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1040) {
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

registerMaterial(EpidoteGneiss2);
