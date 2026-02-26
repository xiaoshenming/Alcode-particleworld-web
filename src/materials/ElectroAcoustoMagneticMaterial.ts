import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电声磁材料 —— 电-声-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)通电产生振动（生成烟(7)）
 * - 受振动产生磁效应（生成磁铁(42)）
 * - 深青灰色带电声纹理
 */

export const ElectroAcoustoMagneticMaterial: MaterialDef = {
  id: 715,
  name: '电声磁材料',
  category: '固体',
  description: '电-声-磁三场耦合功能材料，用于电声换能和磁声成像',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 72 + Math.floor(Math.random() * 12);
      g = 95 + Math.floor(Math.random() * 10);
      b = 108 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 58 + Math.floor(Math.random() * 10);
      g = 82 + Math.floor(Math.random() * 8);
      b = 95 + Math.floor(Math.random() * 12);
    } else {
      r = 85 + Math.floor(Math.random() * 15);
      g = 108 + Math.floor(Math.random() * 10);
      b = 122 + Math.floor(Math.random() * 12);
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

      // 遇电线通电产生振动（模拟电→声）
      if (nid === 44 && Math.random() < 0.03) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 7);
          world.wakeArea(x, fy);
        }
      }

      // 受振动产生磁效应（模拟声→磁）
      if (nid === 50 && Math.random() < 0.035) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 42);
          world.wakeArea(x, fy);
        }
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

registerMaterial(ElectroAcoustoMagneticMaterial);
