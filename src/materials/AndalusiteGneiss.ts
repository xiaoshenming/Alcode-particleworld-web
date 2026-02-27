import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 红柱石片麻岩 —— 含红柱石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1200° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 灰褐色带红柱石粉红条纹
 */

export const AndalusiteGneiss: MaterialDef = {
  id: 689,
  name: '红柱石片麻岩',
  category: '固体',
  description: '含红柱石矿物的片麻岩，属于低压高温变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 162 + Math.floor(Math.random() * 12);
      g = 138 + Math.floor(Math.random() * 10);
      b = 132 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 175 + Math.floor(Math.random() * 10);
      g = 148 + Math.floor(Math.random() * 10);
      b = 140 + Math.floor(Math.random() * 10);
    } else {
      r = 148 + Math.floor(Math.random() * 10);
      g = 128 + Math.floor(Math.random() * 10);
      b = 122 + Math.floor(Math.random() * 8);
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

      if (nid === 9 && Math.random() < 0.003) {
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

registerMaterial(AndalusiteGneiss);
