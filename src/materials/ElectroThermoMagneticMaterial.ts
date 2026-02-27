import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电热磁材料 —— 电-热-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)通电产生热效应（升温）
 * - 高温时产生磁效应（生成磁铁(42)）
 * - 深红铜色带电热纹理
 */

export const ElectroThermoMagneticMaterial: MaterialDef = {
  id: 690,
  name: '电热磁材料',
  category: '固体',
  description: '电-热-磁三场耦合功能材料，用于电磁加热和磁热泵',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 148 + Math.floor(Math.random() * 15);
      g = 52 + Math.floor(Math.random() * 10);
      b = 48 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 132 + Math.floor(Math.random() * 12);
      g = 38 + Math.floor(Math.random() * 8);
      b = 35 + Math.floor(Math.random() * 8);
    } else {
      r = 165 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 10);
      b = 58 + Math.floor(Math.random() * 10);
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

      // 遇电线产生热效应（模拟电→热）
      if (nid === 44 && Math.random() < 0.04) {
        world.addTemp(x, y, 50);
        world.wakeArea(x, y);
      }

      // 高温时产生磁效应（模拟热→磁）
      if (temp > 500 && Math.random() < 0.03) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 42);
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

registerMaterial(ElectroThermoMagneticMaterial);
