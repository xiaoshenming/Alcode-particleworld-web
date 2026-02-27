import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 绿纤石岩 —— 富含绿纤石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >1800° 熔化为熔岩
 * - 耐酸性中等
 * - 深绿灰色，纤维状纹理
 */

export const GreenFibrousRock: MaterialDef = {
  id: 484,
  name: '绿纤石岩',
  category: '固体',
  description: '富含绿纤石的变质岩，深绿灰色纤维状构造',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 48 + Math.floor(Math.random() * 12);
      g = 65 + Math.floor(Math.random() * 14);
      b = 45 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 60 + Math.floor(Math.random() * 12);
      g = 78 + Math.floor(Math.random() * 14);
      b = 55 + Math.floor(Math.random() * 10);
    } else {
      r = 38 + Math.floor(Math.random() * 8);
      g = 52 + Math.floor(Math.random() * 10);
      b = 36 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1800) {
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

registerMaterial(GreenFibrousRock);
