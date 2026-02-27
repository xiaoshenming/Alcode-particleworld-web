import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磁热电材料 —— 磁-热-电三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)升温（模拟磁→热）
 * - 高温时产生电效应（生成火花(28)）
 * - 深灰蓝色带磁热纹理
 */

export const MagnetoThermoElectricMaterial: MaterialDef = {
  id: 725,
  name: '磁热电材料',
  category: '固体',
  description: '磁-热-电三场耦合功能材料，用于磁制冷和热电转换',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 82 + Math.floor(Math.random() * 12);
      g = 92 + Math.floor(Math.random() * 10);
      b = 125 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 68 + Math.floor(Math.random() * 10);
      g = 78 + Math.floor(Math.random() * 8);
      b = 112 + Math.floor(Math.random() * 12);
    } else {
      r = 95 + Math.floor(Math.random() * 15);
      g = 105 + Math.floor(Math.random() * 10);
      b = 140 + Math.floor(Math.random() * 12);
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

      // 遇磁铁升温（模拟磁→热）
      if (nid === 42 && Math.random() < 0.04) {
        world.addTemp(x, y, 45);
        world.wakeArea(x, y);
      }

      // 高温时产生电效应（模拟热→电）
      if (temp > 360 && Math.random() < 0.03) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
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

registerMaterial(MagnetoThermoElectricMaterial);
