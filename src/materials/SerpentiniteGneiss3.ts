import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛇纹石片麻岩(3) —— 蛇纹石与片麻岩的变质岩
 * - 固体，密度 Infinity
 * - 深绿色带条纹纹理
 */

export const SerpentiniteGneiss3: MaterialDef = {
  id: 1079,
  name: '蛇纹石片麻岩(3)',
  category: '固体',
  description: '蛇纹石与片麻岩的高级变质岩，具有蛇纹状纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 58 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 25);
      b = 62 + Math.floor(Math.random() * 18);
    } else if (phase < 0.8) {
      r = 65 + Math.floor(Math.random() * 12);
      g = 105 + Math.floor(Math.random() * 15);
      b = 70 + Math.floor(Math.random() * 12);
    } else {
      r = 52 + Math.floor(Math.random() * 10);
      g = 88 + Math.floor(Math.random() * 10);
      b = 55 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(SerpentiniteGneiss3);
