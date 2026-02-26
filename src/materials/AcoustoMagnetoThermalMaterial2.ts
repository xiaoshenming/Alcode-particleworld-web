import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声磁热材料(2) —— 声-磁-热三场耦合功能材料变种
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)产生电效应（生成火花(28)在空位）
 * - 遇电线(44)升温
 * - 青铜灰色带声磁纹理
 */

export const AcoustoMagnetoThermalMaterial2: MaterialDef = {
  id: 845,
  name: '声磁热材料(2)',
  category: '固体',
  description: '第二代声磁热复合材料，具有增强的声磁热耦合效应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 25);
      g = 145 + Math.floor(Math.random() * 20);
      b = 135 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      r = 163 + Math.floor(Math.random() * 15);
      g = 153 + Math.floor(Math.random() * 16);
      b = 143 + Math.floor(Math.random() * 17);
    } else {
      r = 155 + Math.floor(Math.random() * 10);
      g = 145 + Math.floor(Math.random() * 10);
      b = 135 + Math.floor(Math.random() * 10);
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

      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
          world.wakeArea(x, fy);
        }
      }

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

registerMaterial(AcoustoMagnetoThermalMaterial2);
