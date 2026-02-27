import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磁电光材料 —— 磁-电-光三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)产生电效应（生成闪电(16)）
 * - 遇电线(44)/闪电(16)产生光效应（生成荧光(133)）
 * - 深靛蓝色带磁电纹理
 */

export const MagnetoElectroOpticMaterial: MaterialDef = {
  id: 560,
  name: '磁电光材料',
  category: '固体',
  description: '磁-电-光三场耦合功能材料，用于多物理场传感和信息存储',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 48 + Math.floor(Math.random() * 12);
      g = 42 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 35 + Math.floor(Math.random() * 10);
      g = 30 + Math.floor(Math.random() * 8);
      b = 128 + Math.floor(Math.random() * 12);
    } else {
      r = 62 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 12);
      b = 168 + Math.floor(Math.random() * 18);
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

      // 遇磁铁产生闪电
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 16);
          world.wakeArea(x, fy);
        }
      }

      // 遇电线/闪电产生荧光
      if ((nid === 44 || nid === 16) && Math.random() < 0.06) {
        const sdx = Math.random() < 0.5 ? -1 : 1;
        const sy = y - 1;
        if (world.inBounds(x + sdx, sy) && world.get(x + sdx, sy) === 0) {
          world.set(x + sdx, sy, 133);
          world.wakeArea(x + sdx, sy);
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

registerMaterial(MagnetoElectroOpticMaterial);
