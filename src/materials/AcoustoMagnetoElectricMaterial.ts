import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声磁电材料 —— 声-磁-电三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇蒸汽(8)产生磁效应（唤醒周围磁铁(42)）
 * - 遇磁铁(42)产生电效应（生成闪电(16)）
 * - 深灰蓝色带声磁纹理
 */

export const AcoustoMagnetoElectricMaterial: MaterialDef = {
  id: 570,
  name: '声磁电材料',
  category: '固体',
  description: '声-磁-电三场耦合功能材料，用于声波能量采集和磁电传感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 68 + Math.floor(Math.random() * 12);
      g = 72 + Math.floor(Math.random() * 10);
      b = 108 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 52 + Math.floor(Math.random() * 10);
      g = 58 + Math.floor(Math.random() * 8);
      b = 92 + Math.floor(Math.random() * 12);
    } else {
      r = 82 + Math.floor(Math.random() * 15);
      g = 88 + Math.floor(Math.random() * 12);
      b = 128 + Math.floor(Math.random() * 18);
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

      // 遇蒸汽唤醒周围区域（模拟声波→磁效应）
      if (nid === 8 && Math.random() < 0.06) {
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

registerMaterial(AcoustoMagnetoElectricMaterial);
