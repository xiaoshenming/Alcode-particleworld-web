import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电磁声材料 —— 电-磁-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)/闪电(16)产生磁效应（生成磁铁(42)）
 * - 遇磁铁(42)产生声效应（生成龙卷风(50)）
 * - 深钴蓝色带电磁纹理
 */

export const ElectroMagnetoSonicMaterial: MaterialDef = {
  id: 665,
  name: '电磁声材料',
  category: '固体',
  description: '电-磁-声三场耦合功能材料，用于电磁超声检测和声纳系统',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 42 + Math.floor(Math.random() * 12);
      g = 58 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 30 + Math.floor(Math.random() * 10);
      g = 45 + Math.floor(Math.random() * 8);
      b = 132 + Math.floor(Math.random() * 12);
    } else {
      r = 55 + Math.floor(Math.random() * 15);
      g = 72 + Math.floor(Math.random() * 12);
      b = 165 + Math.floor(Math.random() * 12);
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

      // 遇电产生磁效应（模拟电→磁）
      if ((nid === 44 || nid === 16) && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 42);
          world.wakeArea(x, fy);
        }
      }

      // 遇磁产生声效应（模拟磁→声）
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 50);
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

registerMaterial(ElectroMagnetoSonicMaterial);
