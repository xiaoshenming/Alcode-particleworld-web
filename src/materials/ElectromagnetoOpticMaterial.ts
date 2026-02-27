import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 电磁光材料 —— 电-磁-光三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)/闪电(16)产生磁效应（吸引附近金属粒子）
 * - 遇磁铁(42)产生光效应（生成荧光）
 * - 深靛蓝色带电磁纹理
 */

export const ElectromagnetoOpticMaterial: MaterialDef = {
  id: 605,
  name: '电磁光材料',
  category: '固体',
  description: '电-磁-光三场耦合功能材料，用于光隔离器和磁光存储',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 55 + Math.floor(Math.random() * 12);
      g = 48 + Math.floor(Math.random() * 10);
      b = 128 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 42 + Math.floor(Math.random() * 10);
      g = 35 + Math.floor(Math.random() * 8);
      b = 112 + Math.floor(Math.random() * 12);
    } else {
      r = 68 + Math.floor(Math.random() * 15);
      g = 58 + Math.floor(Math.random() * 12);
      b = 145 + Math.floor(Math.random() * 18);
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

      // 遇电线/闪电产生磁效应（模拟电→磁）
      if ((nid === 44 || nid === 16) && Math.random() < 0.06) {
        world.addTemp(x, y, 30);
        world.wakeArea(x, y);
      }

      // 遇磁铁产生光效应（模拟磁→光）
      if (nid === 42 && Math.random() < 0.05) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 48);
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

registerMaterial(ElectromagnetoOpticMaterial);
