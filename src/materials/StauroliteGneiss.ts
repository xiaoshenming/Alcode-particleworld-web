import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 十字石片麻岩 —— 含十字石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1140° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 深褐灰色带十字石斑晶
 */

export const StauroliteGneiss: MaterialDef = {
  id: 674,
  name: '十字石片麻岩',
  category: '固体',
  description: '含十字石矿物的片麻岩，属于中级区域变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 98 + Math.floor(Math.random() * 12);
      g = 78 + Math.floor(Math.random() * 10);
      b = 68 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 112 + Math.floor(Math.random() * 10);
      g = 92 + Math.floor(Math.random() * 10);
      b = 82 + Math.floor(Math.random() * 10);
    } else {
      r = 85 + Math.floor(Math.random() * 10);
      g = 65 + Math.floor(Math.random() * 10);
      b = 55 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1140) {
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

registerMaterial(StauroliteGneiss);
