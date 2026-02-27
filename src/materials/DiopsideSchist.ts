import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 透辉石片岩 —— 含透辉石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1300° → 熔岩(11)
 * - 耐酸腐蚀
 * - 浅绿灰色带柱状纹理
 */

export const DiopsideSchist: MaterialDef = {
  id: 554,
  name: '透辉石片岩',
  category: '固体',
  description: '含透辉石矿物的变质岩，指示中高级变质和钙镁质变质条件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 148 + Math.floor(Math.random() * 12);
      g = 168 + Math.floor(Math.random() * 12);
      b = 152 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 168 + Math.floor(Math.random() * 12);
      g = 188 + Math.floor(Math.random() * 10);
      b = 172 + Math.floor(Math.random() * 10);
    } else {
      r = 128 + Math.floor(Math.random() * 10);
      g = 148 + Math.floor(Math.random() * 10);
      b = 132 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1300) {
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

      if (nid === 9 && Math.random() < 0.002) {
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

registerMaterial(DiopsideSchist);
