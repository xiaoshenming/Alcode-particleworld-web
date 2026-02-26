import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电声磁材料 —— 电-声-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)通电产生声效应（生成龙卷风(50)）
 * - 遇龙卷风(50)产生磁效应（生成磁铁(42)）
 * - 深靛蓝色带电声纹理
 */

export const ElectroAcoustoMagneticMaterial: MaterialDef = {
  id: 680,
  name: '电声磁材料',
  category: '固体',
  description: '电-声-磁三场耦合功能材料，用于声纳换能器和磁声成像',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 48 + Math.floor(Math.random() * 12);
      g = 55 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 35 + Math.floor(Math.random() * 10);
      g = 42 + Math.floor(Math.random() * 8);
      b = 132 + Math.floor(Math.random() * 12);
    } else {
      r = 62 + Math.floor(Math.random() * 12);
      g = 68 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 15);
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

      // 遇电线产生声效应（模拟电→声）
      if (nid === 44 && Math.random() < 0.035) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 50);
          world.wakeArea(x, fy);
        }
      }

      // 遇龙卷风产生磁效应（模拟声→磁）
      if (nid === 50 && Math.random() < 0.04) {
        if (world.get(nx, ny) === 50) {
          world.set(nx, ny, 42);
          world.wakeArea(nx, ny);
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
