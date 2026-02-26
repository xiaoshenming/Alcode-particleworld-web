import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热光磁材料 —— 热-光-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 高温时发光（生成光束(48)）
 * - 遇激光(47)/光束(48)产生磁效应（生成磁铁(42)）
 * - 深橙红色带热光纹理
 */

export const ThermoPhotoMagneticMaterial: MaterialDef = {
  id: 700,
  name: '热光磁材料',
  category: '固体',
  description: '热-光-磁三场耦合功能材料，用于热光伏和磁光存储',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 178 + Math.floor(Math.random() * 15);
      g = 72 + Math.floor(Math.random() * 10);
      b = 32 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 162 + Math.floor(Math.random() * 12);
      g = 58 + Math.floor(Math.random() * 8);
      b = 22 + Math.floor(Math.random() * 8);
    } else {
      r = 195 + Math.floor(Math.random() * 15);
      g = 85 + Math.floor(Math.random() * 10);
      b = 42 + Math.floor(Math.random() * 10);
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

      // 高温时发光（模拟热→光）
      if (temp > 400 && Math.random() < 0.03) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 48);
          world.wakeArea(x, fy);
        }
      }

      // 遇激光/光束产生磁效应（模拟光→磁）
      if ((nid === 47 || nid === 48) && Math.random() < 0.035) {
        if (world.get(nx, ny) === nid) {
          world.set(nx, ny, 42);
          world.wakeArea(nx, ny);
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

registerMaterial(ThermoPhotoMagneticMaterial);
