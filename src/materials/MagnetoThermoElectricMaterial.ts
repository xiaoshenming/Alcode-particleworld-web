import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁热电材料 —— 磁-热-电三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)产生热效应（加温周围）
 * - 遇熔岩(11)/火(6)产生电效应（生成闪电(16)）
 * - 深紫褐色带磁热纹理
 */

export const MagnetoThermoElectricMaterial: MaterialDef = {
  id: 600,
  name: '磁热电材料',
  category: '固体',
  description: '磁-热-电三场耦合功能材料，用于磁制冷和热电联产',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 118 + Math.floor(Math.random() * 15);
      g = 48 + Math.floor(Math.random() * 10);
      b = 78 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 102 + Math.floor(Math.random() * 12);
      g = 35 + Math.floor(Math.random() * 8);
      b = 62 + Math.floor(Math.random() * 10);
    } else {
      r = 138 + Math.floor(Math.random() * 18);
      g = 58 + Math.floor(Math.random() * 12);
      b = 92 + Math.floor(Math.random() * 15);
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

      // 遇磁铁产生热效应（模拟磁→热）
      if (nid === 42 && Math.random() < 0.06) {
        world.addTemp(x, y, 45);
        world.wakeArea(x, y);
      }

      // 遇熔岩/火产生闪电（模拟热→电效应）
      if ((nid === 11 || nid === 6) && Math.random() < 0.05) {
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

registerMaterial(MagnetoThermoElectricMaterial);
