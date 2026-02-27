import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 高纯氟化钬铈 —— 钬铈二元稀土氟化物
 * - 固体，密度 Infinity
 * - 高温稳定，光学级纯度
 * - 淡黄橙色晶体
 */

export const HighPurityHolmiumCeriumFluoride: MaterialDef = {
  id: 1068,
  name: '高纯氟化钬铈',
  category: '固体',
  description: '高纯度钬铈复合氟化物，用于磁光存储和激光材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 215 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 18);
      b = 155 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 222 + Math.floor(Math.random() * 12);
      g = 206 + Math.floor(Math.random() * 12);
      b = 162 + Math.floor(Math.random() * 12);
    } else {
      r = 210 + Math.floor(Math.random() * 10);
      g = 195 + Math.floor(Math.random() * 10);
      b = 150 + Math.floor(Math.random() * 10);
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

registerMaterial(HighPurityHolmiumCeriumFluoride);
