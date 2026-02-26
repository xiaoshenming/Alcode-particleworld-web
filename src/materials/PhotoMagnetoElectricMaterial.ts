import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光磁电材料 —— 光-磁-电三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇激光(47)/光束(48)产生磁效应（唤醒周围磁铁(42)）
 * - 遇磁铁(42)产生电效应（生成闪电(16)）
 * - 深紫红色带光磁纹理
 */

export const PhotoMagnetoElectricMaterial: MaterialDef = {
  id: 575,
  name: '光磁电材料',
  category: '固体',
  description: '光-磁-电三场耦合功能材料，用于光控磁电器件和多态存储',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 128 + Math.floor(Math.random() * 15);
      g = 38 + Math.floor(Math.random() * 10);
      b = 108 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 108 + Math.floor(Math.random() * 12);
      g = 28 + Math.floor(Math.random() * 8);
      b = 92 + Math.floor(Math.random() * 12);
    } else {
      r = 148 + Math.floor(Math.random() * 18);
      g = 48 + Math.floor(Math.random() * 12);
      b = 128 + Math.floor(Math.random() * 18);
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

      // 遇激光/光束唤醒周围（模拟光→磁效应）
      if ((nid === 47 || nid === 48) && Math.random() < 0.06) {
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
      }

      // 遇磁铁产生闪电
      if (nid === 42 && Math.random() < 0.05) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 16);
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

registerMaterial(PhotoMagnetoElectricMaterial);
