import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁光电材料 —— 磁-光-电三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)产生光效应（生成荧光粉(133)在空位）
 * - 遇光束(48)产生电效应（生成火花(28)在空位）
 * - 深灰蓝紫色带磁光纹理
 */

export const MagnetoOptoElectricMaterial: MaterialDef = {
  id: 745,
  name: '磁光电材料',
  category: '固体',
  description: '磁-光-电三场耦合功能材料，用于光隔离器和磁光传感器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 88 + Math.floor(Math.random() * 12);
      g = 78 + Math.floor(Math.random() * 12);
      b = 128 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 98 + Math.floor(Math.random() * 13);
      g = 88 + Math.floor(Math.random() * 13);
      b = 138 + Math.floor(Math.random() * 15);
    } else {
      r = 88 + Math.floor(Math.random() * 10);
      g = 80 + Math.floor(Math.random() * 10);
      b = 130 + Math.floor(Math.random() * 10);
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

      // 遇磁铁产生光效应（磁→光）
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 133);
          world.wakeArea(x, fy);
        }
      }

      // 遇光束产生电效应（光→电）
      if (nid === 48 && Math.random() < 0.03) {
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

registerMaterial(MagnetoOptoElectricMaterial);
