import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 滑石片麻岩(2) —— 富含滑石的片麻岩变种
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1030° → 熔岩(11)
 * - 耐酸腐蚀
 * - 浅灰绿色带滑石条纹
 */

export const TalcGneiss2: MaterialDef = {
  id: 794,
  name: '滑石片麻岩(2)',
  category: '固体',
  description: '富含滑石的片麻岩变种，质地柔软具有滑腻手感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 165 + Math.floor(Math.random() * 20);
      g = 170 + Math.floor(Math.random() * 20);
      b = 160 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 175 + Math.floor(Math.random() * 10);
      g = 180 + Math.floor(Math.random() * 10);
      b = 170 + Math.floor(Math.random() * 10);
    } else {
      r = 165 + Math.floor(Math.random() * 8);
      g = 170 + Math.floor(Math.random() * 8);
      b = 160 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1030) {
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

registerMaterial(TalcGneiss2);
