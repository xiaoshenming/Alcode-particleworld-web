import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光电热材料 —— 光-电-热三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇光束(48)产生电效应（生成火花(28)）
 * - 遇火花(28)升温（模拟电→热）
 * - 深灰紫色带光电纹理
 */

export const PhotoElectroThermalMaterial: MaterialDef = {
  id: 735,
  name: '光电热材料',
  category: '固体',
  description: '光-电-热三场耦合功能材料，用于光伏热电和传感器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 108 + Math.floor(Math.random() * 12);
      g = 82 + Math.floor(Math.random() * 12);
      b = 118 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 122 + Math.floor(Math.random() * 8);
      g = 95 + Math.floor(Math.random() * 10);
      b = 132 + Math.floor(Math.random() * 10);
    } else {
      r = 115 + Math.floor(Math.random() * 10);
      g = 88 + Math.floor(Math.random() * 10);
      b = 125 + Math.floor(Math.random() * 12);
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

      // 遇光束产生电效应（模拟光→电）
      if (nid === 48 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
          world.wakeArea(x, fy);
        }
      }

      // 遇火花升温（模拟电→热）
      if (nid === 28 && Math.random() < 0.05) {
        world.addTemp(x, y, 35);
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

registerMaterial(PhotoElectroThermalMaterial);
