import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 声磁光材料 —— 声-磁-光三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 受振动（邻近龙卷风(50)）产生磁效应（生成磁铁(42)）
 * - 遇磁铁(42)发光（生成光束(48)）
 * - 深蓝紫色带声磁纹理
 */

export const AcoustoMagnetoOpticMaterial: MaterialDef = {
  id: 710,
  name: '声磁光材料',
  category: '固体',
  description: '声-磁-光三场耦合功能材料，用于声光调制和磁光存储',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 68 + Math.floor(Math.random() * 12);
      g = 52 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 55 + Math.floor(Math.random() * 10);
      g = 40 + Math.floor(Math.random() * 8);
      b = 132 + Math.floor(Math.random() * 12);
    } else {
      r = 82 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 12);
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

      // 受振动产生磁效应（模拟声→磁）
      if (nid === 50 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 42);
          world.wakeArea(x, fy);
        }
      }

      // 遇磁铁发光（模拟磁→光）
      if (nid === 42 && Math.random() < 0.035) {
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

registerMaterial(AcoustoMagnetoOpticMaterial);
