import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硅灰石片麻岩(2) —— 富含硅灰石的片麻岩变种
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1060° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 浅灰白色带硅灰石条纹
 */

export const WollastoniteGneiss2: MaterialDef = {
  id: 769,
  name: '硅灰石片麻岩(2)',
  category: '固体',
  description: '富含硅灰石的片麻岩变种，属于高级接触变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 178 + Math.floor(Math.random() * 21);
      g = 175 + Math.floor(Math.random() * 21);
      b = 170 + Math.floor(Math.random() * 21);
    } else if (phase < 0.8) {
      r = 190 + Math.floor(Math.random() * 8);
      g = 187 + Math.floor(Math.random() * 8);
      b = 182 + Math.floor(Math.random() * 8);
    } else {
      r = 172 + Math.floor(Math.random() * 10);
      g = 168 + Math.floor(Math.random() * 10);
      b = 164 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1060) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
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

registerMaterial(WollastoniteGneiss2);
