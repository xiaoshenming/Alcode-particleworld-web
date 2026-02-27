import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 绿色片岩 —— 低级区域变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >2100° 熔化为熔岩
 * - 耐酸性较弱
 * - 灰绿色带明显片理构造，富含绿泥石和绿帘石
 */

export const GreenSlateSchist: MaterialDef = {
  id: 469,
  name: '绿色片岩',
  category: '固体',
  description: '低级区域变质岩，灰绿色片理构造，富含绿泥石和绿帘石',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 灰绿基底
      r = 60 + Math.floor(Math.random() * 12);
      g = 78 + Math.floor(Math.random() * 15);
      b = 58 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 浅绿片理
      r = 75 + Math.floor(Math.random() * 15);
      g = 98 + Math.floor(Math.random() * 18);
      b = 72 + Math.floor(Math.random() * 12);
    } else {
      // 暗色矿物
      r = 45 + Math.floor(Math.random() * 10);
      g = 55 + Math.floor(Math.random() * 10);
      b = 42 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2100) {
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

      if (nid === 9 && Math.random() < 0.007) {
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

registerMaterial(GreenSlateSchist);
