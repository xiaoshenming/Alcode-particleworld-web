import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 方解石片麻岩(7) —— 方解石与片麻岩的高级变质岩
 * - 固体，密度 Infinity
 * - 乳白色调
 */

export const CalciteGneiss7: MaterialDef = {
  id: 1229,
  name: '方解石片麻岩(7)',
  category: '固体',
  description: '方解石与片麻岩的高级变质岩，具有菱形解理纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 228 + Math.floor(Math.random() * 22);
      g = 226 + Math.floor(Math.random() * 22);
      b = 222 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 232 + Math.floor(Math.random() * 12);
      g = 230 + Math.floor(Math.random() * 12);
      b = 226 + Math.floor(Math.random() * 12);
    } else {
      r = 224 + Math.floor(Math.random() * 10);
      g = 222 + Math.floor(Math.random() * 10);
      b = 218 + Math.floor(Math.random() * 10);
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

registerMaterial(CalciteGneiss7);
