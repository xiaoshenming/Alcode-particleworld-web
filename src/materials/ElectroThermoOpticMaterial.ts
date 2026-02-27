import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 电热光材料 —— 电-热-光三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)升温（模拟电→热）
 * - 高温时产生光效应（生成荧光粉(133)）
 * - 深灰绿色带电热纹理
 */

export const ElectroThermoOpticMaterial: MaterialDef = {
  id: 730,
  name: '电热光材料',
  category: '固体',
  description: '电-热-光三场耦合功能材料，用于光电热转换和智能照明',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 78 + Math.floor(Math.random() * 12);
      g = 105 + Math.floor(Math.random() * 12);
      b = 88 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 85 + Math.floor(Math.random() * 15);
      g = 115 + Math.floor(Math.random() * 15);
      b = 98 + Math.floor(Math.random() * 17);
    } else {
      r = 90 + Math.floor(Math.random() * 10);
      g = 120 + Math.floor(Math.random() * 10);
      b = 105 + Math.floor(Math.random() * 10);
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

      // 遇电线升温（模拟电→热）
      if (nid === 44 && Math.random() < 0.04) {
        world.addTemp(x, y, 40);
        world.wakeArea(x, y);
      }

      // 高温时产生光效应（模拟热→光）
      if (temp > 350 && Math.random() < 0.03) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 133);
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

registerMaterial(ElectroThermoOpticMaterial);
