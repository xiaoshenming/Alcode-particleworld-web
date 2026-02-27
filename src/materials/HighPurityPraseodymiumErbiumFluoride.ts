import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 高纯氟化镨铒 —— 镨铒二元稀土氟化物
 * - 固体，密度 Infinity
 * - 淡绿白色晶体
 */

export const HighPurityPraseodymiumErbiumFluoride: MaterialDef = {
  id: 1208,
  name: '高纯氟化镨铒',
  category: '固体',
  description: '高纯度镨铒复合氟化物，用于光纤通信和激光器件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 226 + Math.floor(Math.random() * 16);
      g = 234 + Math.floor(Math.random() * 16);
      b = 228 + Math.floor(Math.random() * 14);
    } else if (phase < 0.8) {
      r = 230 + Math.floor(Math.random() * 12);
      g = 238 + Math.floor(Math.random() * 12);
      b = 232 + Math.floor(Math.random() * 10);
    } else {
      r = 222 + Math.floor(Math.random() * 10);
      g = 230 + Math.floor(Math.random() * 10);
      b = 224 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const dirs = DIRS4;
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

registerMaterial(HighPurityPraseodymiumErbiumFluoride);
