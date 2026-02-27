import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 透闪石片岩 —— 含透闪石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1200° → 熔岩(11)
 * - 耐酸腐蚀
 * - 灰白绿色带纤维状纹理
 */

export const TremoliteSchist: MaterialDef = {
  id: 564,
  name: '透闪石片岩',
  category: '固体',
  description: '含透闪石矿物的变质岩，指示中级变质和钙镁质岩石变质条件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 188 + Math.floor(Math.random() * 12);
      g = 198 + Math.floor(Math.random() * 10);
      b = 185 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 208 + Math.floor(Math.random() * 12);
      g = 218 + Math.floor(Math.random() * 10);
      b = 205 + Math.floor(Math.random() * 10);
    } else {
      r = 168 + Math.floor(Math.random() * 10);
      g = 178 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1200) {
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

registerMaterial(TremoliteSchist);
