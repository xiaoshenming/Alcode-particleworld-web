import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光电磁材料 —— 光-电-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇激光(47)/光束(48)产生电效应（生成闪电(16)）
 * - 遇闪电(16)产生磁效应（唤醒周围磁铁(42)）
 * - 深靛蓝色带光电纹理
 */

export const PhotoElectroMagneticMaterial: MaterialDef = {
  id: 590,
  name: '光电磁材料',
  category: '固体',
  description: '光-电-磁三场耦合功能材料，用于光电探测和电磁屏蔽',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 48 + Math.floor(Math.random() * 12);
      g = 55 + Math.floor(Math.random() * 10);
      b = 138 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 35 + Math.floor(Math.random() * 10);
      g = 42 + Math.floor(Math.random() * 8);
      b = 118 + Math.floor(Math.random() * 12);
    } else {
      r = 62 + Math.floor(Math.random() * 15);
      g = 68 + Math.floor(Math.random() * 12);
      b = 158 + Math.floor(Math.random() * 18);
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

      // 遇激光/光束产生闪电（模拟光→电效应）
      if ((nid === 47 || nid === 48) && Math.random() < 0.06) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 16);
          world.wakeArea(x, fy);
        }
      }

      // 遇闪电唤醒周围（模拟电→磁效应）
      if (nid === 16 && Math.random() < 0.05) {
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
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

registerMaterial(PhotoElectroMagneticMaterial);
