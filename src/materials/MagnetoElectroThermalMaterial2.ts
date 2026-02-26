import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁电热材料(2) —— 磁-电-热三场耦合功能材料变种
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)产生电效应（生成火花(28)在空位）
 * - 遇电线(44)升温
 * - 深灰蓝绿色带磁电纹理
 */

export const MagnetoElectroThermalMaterial2: MaterialDef = {
  id: 775,
  name: '磁电热材料(2)',
  category: '固体',
  description: '磁-电-热三场耦合功能材料变种，用于多物理场传感器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 72 + Math.floor(Math.random() * 23);
      g = 95 + Math.floor(Math.random() * 23);
      b = 108 + Math.floor(Math.random() * 24);
    } else if (phase < 0.8) {
      r = 80 + Math.floor(Math.random() * 15);
      g = 102 + Math.floor(Math.random() * 16);
      b = 115 + Math.floor(Math.random() * 17);
    } else {
      r = 72 + Math.floor(Math.random() * 10);
      g = 95 + Math.floor(Math.random() * 10);
      b = 108 + Math.floor(Math.random() * 10);
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

      // 遇磁铁产生电效应（生成火花在空位）
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
          world.wakeArea(x, fy);
        }
      }

      // 遇电线升温
      if (nid === 44 && Math.random() < 0.04) {
        world.addTemp(x, y, 40);
        world.wakeArea(x, y);
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

registerMaterial(MagnetoElectroThermalMaterial2);
