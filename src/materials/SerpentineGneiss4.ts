import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛇纹石片麻岩(4) —— 蛇纹石与片麻岩的变质岩
 * - 固体，密度 Infinity
 * - 暗绿黄色调
 */

export const SerpentineGneiss4: MaterialDef = {
  id: 1204,
  name: '蛇纹石片麻岩(4)',
  category: '固体',
  description: '蛇纹石与片麻岩的高级变质岩，具有蛇纹状纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 126 + Math.floor(Math.random() * 22);
      g = 146 + Math.floor(Math.random() * 22);
      b = 112 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 136 + Math.floor(Math.random() * 12);
      g = 156 + Math.floor(Math.random() * 12);
      b = 122 + Math.floor(Math.random() * 12);
    } else {
      r = 120 + Math.floor(Math.random() * 10);
      g = 140 + Math.floor(Math.random() * 10);
      b = 106 + Math.floor(Math.random() * 10);
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

registerMaterial(SerpentineGneiss4);
