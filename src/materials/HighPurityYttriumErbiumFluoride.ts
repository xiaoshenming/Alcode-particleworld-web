import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 高纯氟化钇铒 —— 钇铒二元稀土氟化物
 * - 固体，密度 Infinity
 * - 淡黄白色晶体
 */

export const HighPurityYttriumErbiumFluoride: MaterialDef = {
  id: 1248,
  name: '高纯氟化钇铒',
  category: '固体',
  description: '高纯度钇铒复合氟化物，用于激光晶体和光学玻璃',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 234 + Math.floor(Math.random() * 16);
      g = 228 + Math.floor(Math.random() * 16);
      b = 218 + Math.floor(Math.random() * 14);
    } else if (phase < 0.8) {
      r = 242 + Math.floor(Math.random() * 10);
      g = 236 + Math.floor(Math.random() * 10);
      b = 226 + Math.floor(Math.random() * 8);
    } else {
      r = 228 + Math.floor(Math.random() * 10);
      g = 222 + Math.floor(Math.random() * 10);
      b = 212 + Math.floor(Math.random() * 10);
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
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.05) {
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

registerMaterial(HighPurityYttriumErbiumFluoride);
