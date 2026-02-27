import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 绿泥石片岩 —— 含绿泥石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1150° → 熔岩(11)
 * - 较易被酸腐蚀
 * - 暗绿色带鳞片状纹理
 */

export const ChloriteSchist: MaterialDef = {
  id: 574,
  name: '绿泥石片岩',
  category: '固体',
  description: '含绿泥石矿物的变质岩，指示低级绿片岩相变质条件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 82 + Math.floor(Math.random() * 12);
      g = 118 + Math.floor(Math.random() * 12);
      b = 88 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 98 + Math.floor(Math.random() * 12);
      g = 138 + Math.floor(Math.random() * 10);
      b = 105 + Math.floor(Math.random() * 10);
    } else {
      r = 65 + Math.floor(Math.random() * 10);
      g = 98 + Math.floor(Math.random() * 10);
      b = 72 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

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

registerMaterial(ChloriteSchist);
