import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 高纯氟化镝铒 —— 镝铒二元稀土氟化物
 * - 固体，密度 Infinity
 * - 淡青白色晶体
 */

export const HighPurityDysprosiumErbiumFluoride: MaterialDef = {
  id: 1223,
  name: '高纯氟化镝铒',
  category: '固体',
  description: '高纯度镝铒复合氟化物，用于高功率激光和红外光学',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 222 + Math.floor(Math.random() * 16);
      g = 232 + Math.floor(Math.random() * 16);
      b = 234 + Math.floor(Math.random() * 14);
    } else if (phase < 0.8) {
      r = 230 + Math.floor(Math.random() * 10);
      g = 240 + Math.floor(Math.random() * 10);
      b = 242 + Math.floor(Math.random() * 8);
    } else {
      r = 216 + Math.floor(Math.random() * 10);
      g = 226 + Math.floor(Math.random() * 10);
      b = 228 + Math.floor(Math.random() * 10);
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

registerMaterial(HighPurityDysprosiumErbiumFluoride);
