import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 电磁光材料(2) —— 电-磁-光三场耦合材料
 * - 固体，密度 Infinity
 * - 电场可产生磁场和光学响应
 * - 深蓝紫色调
 */

export const ElectroMagnetoPhotoMaterial2: MaterialDef = {
  id: 1115,
  name: '电磁光材料(2)',
  category: '固体',
  description: '电-磁-光三场耦合材料，电场同时产生磁场和光学响应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 65 + Math.floor(Math.random() * 20);
      g = 55 + Math.floor(Math.random() * 20);
      b = 155 + Math.floor(Math.random() * 22);
    } else if (phase < 0.8) {
      r = 72 + Math.floor(Math.random() * 12);
      g = 62 + Math.floor(Math.random() * 12);
      b = 165 + Math.floor(Math.random() * 12);
    } else {
      r = 58 + Math.floor(Math.random() * 10);
      g = 48 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 10);
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
      if (nid === 9 && Math.random() < 0.0005) {
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

registerMaterial(ElectroMagnetoPhotoMaterial2);
