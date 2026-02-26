import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光热磁材料 —— 光-热-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇激光(47)/光束(48)升温（模拟光→热）
 * - 高温时产生磁效应（生成磁铁(42)）
 * - 深紫红色带光热纹理
 */

export const PhotoThermalMagneticMaterial: MaterialDef = {
  id: 705,
  name: '光热磁材料',
  category: '固体',
  description: '光-热-磁三场耦合功能材料，用于光热发电和磁光传感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 15);
      g = 48 + Math.floor(Math.random() * 10);
      b = 92 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 140 + Math.floor(Math.random() * 12);
      g = 35 + Math.floor(Math.random() * 8);
      b = 78 + Math.floor(Math.random() * 10);
    } else {
      r = 172 + Math.floor(Math.random() * 15);
      g = 58 + Math.floor(Math.random() * 10);
      b = 105 + Math.floor(Math.random() * 12);
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

      // 遇激光/光束升温（模拟光→热）
      if ((nid === 47 || nid === 48) && Math.random() < 0.04) {
        world.addTemp(x, y, 50);
        world.wakeArea(x, y);
      }

      // 高温时产生磁效应（模拟热→磁）
      if (temp > 350 && Math.random() < 0.03) {
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

registerMaterial(PhotoThermalMagneticMaterial);
