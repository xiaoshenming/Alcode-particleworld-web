import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电磁声材料(2) —— 电-磁-声三场耦合功能材料变种
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)产生磁效应（吸引附近金属粒子）
 * - 遇磁铁(42)产生声效应（生成龙卷风(50)碎片在空位）
 * - 深灰蓝色带电磁纹理
 */

export const ElectroMagnetoAcousticMaterial2: MaterialDef = {
  id: 755,
  name: '电磁声材料(2)',
  category: '固体',
  description: '电-磁-声三场耦合功能材料变种，用于高级电磁超声检测',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 75 + Math.floor(Math.random() * 12);
      g = 85 + Math.floor(Math.random() * 12);
      b = 120 + Math.floor(Math.random() * 13);
    } else if (phase < 0.8) {
      r = 82 + Math.floor(Math.random() * 10);
      g = 92 + Math.floor(Math.random() * 10);
      b = 130 + Math.floor(Math.random() * 10);
    } else {
      r = 88 + Math.floor(Math.random() * 10);
      g = 98 + Math.floor(Math.random() * 10);
      b = 135 + Math.floor(Math.random() * 10);
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

      // 遇电线产生磁效应（吸引附近金属粒子）
      if (nid === 44 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 42);
          world.wakeArea(x, fy);
        }
      }

      // 遇磁铁产生声效应（生成龙卷风碎片在空位）
      if (nid === 42 && Math.random() < 0.03) {
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

registerMaterial(ElectroMagnetoAcousticMaterial2);
