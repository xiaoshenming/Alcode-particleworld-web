import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光磁声材料 —— 光-磁-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇激光(47)/光束(48)产生磁效应（生成磁铁(42)）
 * - 遇磁铁(42)产生声效应（生成龙卷风(50)）
 * - 深翠绿色带光磁纹理
 */

export const PhotoMagnetoAcousticMaterial: MaterialDef = {
  id: 695,
  name: '光磁声材料',
  category: '固体',
  description: '光-磁-声三场耦合功能材料，用于光磁声成像和传感器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 28 + Math.floor(Math.random() * 10);
      g = 118 + Math.floor(Math.random() * 15);
      b = 88 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 22 + Math.floor(Math.random() * 8);
      g = 102 + Math.floor(Math.random() * 12);
      b = 75 + Math.floor(Math.random() * 10);
    } else {
      r = 35 + Math.floor(Math.random() * 12);
      g = 135 + Math.floor(Math.random() * 15);
      b = 100 + Math.floor(Math.random() * 12);
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

      // 遇激光/光束产生磁效应（模拟光→磁）
      if ((nid === 47 || nid === 48) && Math.random() < 0.035) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 42);
          world.wakeArea(x, fy);
        }
      }

      // 遇磁铁产生声效应（模拟磁→声）
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

registerMaterial(PhotoMagnetoAcousticMaterial);
