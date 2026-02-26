import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛇纹石片麻岩 —— 含蛇纹石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1060° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 深绿色带蛇纹石条纹纹理
 */

export const SerpentiniteGneiss: MaterialDef = {
  id: 724,
  name: '蛇纹石片麻岩',
  category: '固体',
  description: '含蛇纹石矿物的片麻岩，属于超基性变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 72 + Math.floor(Math.random() * 12);
      g = 108 + Math.floor(Math.random() * 10);
      b = 78 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 85 + Math.floor(Math.random() * 10);
      g = 122 + Math.floor(Math.random() * 10);
      b = 92 + Math.floor(Math.random() * 10);
    } else {
      r = 62 + Math.floor(Math.random() * 10);
      g = 98 + Math.floor(Math.random() * 10);
      b = 68 + Math.floor(Math.random() * 8);
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

registerMaterial(SerpentiniteGneiss);
