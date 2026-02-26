import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蓝晶石片麻岩(2) —— 富含蓝晶石的片麻岩变种
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1130° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 灰蓝色带蓝晶石条纹纹理
 */

export const KyaniteGneiss2: MaterialDef = {
  id: 759,
  name: '蓝晶石片麻岩(2)',
  category: '固体',
  description: '富含蓝晶石的片麻岩变种，属于高压变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 108 + Math.floor(Math.random() * 20);
      g = 125 + Math.floor(Math.random() * 20);
      b = 155 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 118 + Math.floor(Math.random() * 10);
      g = 135 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 10);
    } else {
      r = 110 + Math.floor(Math.random() * 12);
      g = 128 + Math.floor(Math.random() * 12);
      b = 158 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1130) {
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

registerMaterial(KyaniteGneiss2);
