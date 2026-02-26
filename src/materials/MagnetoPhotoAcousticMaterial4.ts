import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磁光声材料(4) —— 第四代磁光声三场耦合材料
 * - 固体，密度 Infinity
 * - 磁场-光场-声波三场耦合效应
 * - 灰蓝偏绿色调
 */

export const MagnetoPhotoAcousticMaterial4: MaterialDef = {
  id: 1070,
  name: '磁光声材料(4)',
  category: '固体',
  description: '第四代磁光声复合材料，具有增强的磁光声耦合效应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 135 + Math.floor(Math.random() * 22);
      g = 152 + Math.floor(Math.random() * 20);
      b = 160 + Math.floor(Math.random() * 22);
    } else if (phase < 0.8) {
      r = 142 + Math.floor(Math.random() * 14);
      g = 160 + Math.floor(Math.random() * 12);
      b = 168 + Math.floor(Math.random() * 14);
    } else {
      r = 130 + Math.floor(Math.random() * 10);
      g = 148 + Math.floor(Math.random() * 10);
      b = 156 + Math.floor(Math.random() * 10);
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
        world.addTemp(x, y, 32);
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

registerMaterial(MagnetoPhotoAcousticMaterial4);
