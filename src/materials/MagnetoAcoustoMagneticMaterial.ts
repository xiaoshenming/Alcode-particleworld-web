import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磁声磁材料 —— 磁-声-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)产生声效应（生成龙卷风(50)）
 * - 遇龙卷风(50)增强磁效应（生成磁铁(42)）
 * - 深紫蓝色带磁声纹理
 */

export const MagnetoAcoustoMagneticMaterial: MaterialDef = {
  id: 685,
  name: '磁声磁材料',
  category: '固体',
  description: '磁-声-磁三场耦合功能材料，用于磁声成像和无损检测',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 72 + Math.floor(Math.random() * 12);
      g = 48 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 58 + Math.floor(Math.random() * 10);
      g = 35 + Math.floor(Math.random() * 8);
      b = 132 + Math.floor(Math.random() * 12);
    } else {
      r = 85 + Math.floor(Math.random() * 12);
      g = 60 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 15);
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

      // 遇磁铁产生声效应（模拟磁→声）
      if (nid === 42 && Math.random() < 0.035) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 50);
          world.wakeArea(x, fy);
        }
      }

      // 遇龙卷风增强磁效应（模拟声→磁）
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

registerMaterial(MagnetoAcoustoMagneticMaterial);
