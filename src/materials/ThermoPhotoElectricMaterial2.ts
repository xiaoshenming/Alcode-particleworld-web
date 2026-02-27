import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 热光电材料(2) —— 热-光-电三场耦合功能材料变种
 * - 固体，密度 Infinity（不可移动）
 * - 高温>370时产生光效应（生成荧光粉(133)在空位）
 * - 遇光束(48)产生电效应（生成火花(28)在空位）
 * - 深灰橙色带热光纹理
 */

export const ThermoPhotoElectricMaterial2: MaterialDef = {
  id: 760,
  name: '热光电材料(2)',
  category: '固体',
  description: '热-光-电三场耦合功能材料变种，用于热光伏和光电转换',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 135 + Math.floor(Math.random() * 23);
      g = 95 + Math.floor(Math.random() * 23);
      b = 72 + Math.floor(Math.random() * 23);
    } else if (phase < 0.8) {
      r = 145 + Math.floor(Math.random() * 13);
      g = 105 + Math.floor(Math.random() * 13);
      b = 80 + Math.floor(Math.random() * 15);
    } else {
      r = 138 + Math.floor(Math.random() * 15);
      g = 98 + Math.floor(Math.random() * 15);
      b = 75 + Math.floor(Math.random() * 15);
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

      // 高温时产生光效应（模拟热→光）
      if (temp > 370 && Math.random() < 0.03) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 133);
          world.wakeArea(x, fy);
        }
      }

      // 遇光束产生电效应（模拟光→电）
      if (nid === 48 && Math.random() < 0.04) {
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

registerMaterial(ThermoPhotoElectricMaterial2);
