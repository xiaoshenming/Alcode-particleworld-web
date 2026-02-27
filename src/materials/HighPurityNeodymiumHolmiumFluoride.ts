import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 高纯氟化钕钬 —— 钕钬二元稀土氟化物
 * - 固体，密度 Infinity
 * - 淡紫白色晶体
 */

export const HighPurityNeodymiumHolmiumFluoride: MaterialDef = {
  id: 1163,
  name: '高纯氟化钕钬',
  category: '固体',
  description: '高纯度钕钬复合氟化物，用于永磁材料和光学器件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 230 + Math.floor(Math.random() * 18);
      g = 224 + Math.floor(Math.random() * 18);
      b = 236 + Math.floor(Math.random() * 14);
    } else if (phase < 0.8) {
      r = 238 + Math.floor(Math.random() * 12);
      g = 232 + Math.floor(Math.random() * 12);
      b = 244 + Math.floor(Math.random() * 8);
    } else {
      r = 224 + Math.floor(Math.random() * 10);
      g = 218 + Math.floor(Math.random() * 10);
      b = 230 + Math.floor(Math.random() * 10);
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
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(HighPurityNeodymiumHolmiumFluoride);
