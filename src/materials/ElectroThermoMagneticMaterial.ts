import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电热磁材料 —— 电-热-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇闪电(16)/电线(44)产生热效应（加温周围）
 * - 遇磁铁(42)产生电效应（生成闪电(16)）
 * - 深橙褐色带电热纹理
 */

export const ElectroThermoMagneticMaterial: MaterialDef = {
  id: 585,
  name: '电热磁材料',
  category: '固体',
  description: '电-热-磁三场耦合功能材料，用于电磁加热和感应熔炼',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 158 + Math.floor(Math.random() * 15);
      g = 88 + Math.floor(Math.random() * 10);
      b = 42 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 138 + Math.floor(Math.random() * 12);
      g = 72 + Math.floor(Math.random() * 8);
      b = 32 + Math.floor(Math.random() * 10);
    } else {
      r = 178 + Math.floor(Math.random() * 18);
      g = 102 + Math.floor(Math.random() * 12);
      b = 52 + Math.floor(Math.random() * 15);
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

      // 遇闪电/电线产生热效应（加温周围）
      if ((nid === 16 || nid === 44) && Math.random() < 0.06) {
        world.addTemp(x, y, 50);
        world.wakeArea(x, y);
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

registerMaterial(ElectroThermoMagneticMaterial);
