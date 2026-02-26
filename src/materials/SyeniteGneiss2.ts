import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 正长石片麻岩(2) —— 富含正长石的片麻岩变种
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1080° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 粉灰色带正长石条纹纹理
 */

export const SyeniteGneiss2: MaterialDef = {
  id: 729,
  name: '正长石片麻岩(2)',
  category: '固体',
  description: '富含正长石的片麻岩变种，属于中酸性变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 175 + Math.floor(Math.random() * 10);
      g = 155 + Math.floor(Math.random() * 10);
      b = 145 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 185 + Math.floor(Math.random() * 10);
      g = 165 + Math.floor(Math.random() * 10);
      b = 155 + Math.floor(Math.random() * 10);
    } else {
      r = 180 + Math.floor(Math.random() * 8);
      g = 160 + Math.floor(Math.random() * 8);
      b = 150 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1080) {
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

registerMaterial(SyeniteGneiss2);
