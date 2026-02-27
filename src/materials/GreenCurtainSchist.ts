import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 绿帘片岩 —— 富含绿帘石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >1850° 熔化为熔岩
 * - 耐酸性中等
 * - 黄绿灰色，带片状纹理
 */

export const GreenCurtainSchist: MaterialDef = {
  id: 479,
  name: '绿帘片岩',
  category: '固体',
  description: '富含绿帘石的变质岩，黄绿灰色片状构造',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 72 + Math.floor(Math.random() * 12);
      g = 82 + Math.floor(Math.random() * 14);
      b = 48 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 85 + Math.floor(Math.random() * 12);
      g = 95 + Math.floor(Math.random() * 14);
      b = 58 + Math.floor(Math.random() * 10);
    } else {
      r = 58 + Math.floor(Math.random() * 10);
      g = 68 + Math.floor(Math.random() * 10);
      b = 40 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1850) {
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

      if (nid === 9 && Math.random() < 0.006) {
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

registerMaterial(GreenCurtainSchist);
