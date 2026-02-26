import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声磁热材料(3) —— 第三代声磁热三场耦合材料
 * - 固体，密度 Infinity
 * - 声波-磁场-热能三场耦合效应
 * - 灰蓝偏暖色调
 */

export const AcoustoMagnetoThermalMaterial3: MaterialDef = {
  id: 1055,
  name: '声磁热材料(3)',
  category: '固体',
  description: '第三代声磁热复合材料，具有增强的声磁热耦合效应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 142 + Math.floor(Math.random() * 25);
      g = 146 + Math.floor(Math.random() * 20);
      b = 162 + Math.floor(Math.random() * 22);
    } else if (phase < 0.8) {
      r = 150 + Math.floor(Math.random() * 15);
      g = 154 + Math.floor(Math.random() * 14);
      b = 170 + Math.floor(Math.random() * 15);
    } else {
      r = 138 + Math.floor(Math.random() * 10);
      g = 142 + Math.floor(Math.random() * 10);
      b = 158 + Math.floor(Math.random() * 10);
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
        world.addTemp(x, y, 35);
        world.wakeArea(x, y);
      }
      if (nid === 44 && Math.random() < 0.04) {
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

registerMaterial(AcoustoMagnetoThermalMaterial3);
