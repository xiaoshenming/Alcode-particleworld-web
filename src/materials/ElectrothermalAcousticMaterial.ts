import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 电热声材料 —— 电-热-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)升温并产生声波
 * - 高温 >700° 生成蒸汽(8)模拟声波
 * - 暗铜绿色带电弧纹理
 */

export const ElectrothermalAcousticMaterial: MaterialDef = {
  id: 540,
  name: '电热声材料',
  category: '固体',
  description: '电-热-声三场耦合功能材料，用于超声换能器和声学传感器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 78 + Math.floor(Math.random() * 12);
      g = 108 + Math.floor(Math.random() * 15);
      b = 95 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 62 + Math.floor(Math.random() * 10);
      g = 92 + Math.floor(Math.random() * 12);
      b = 80 + Math.floor(Math.random() * 10);
    } else {
      r = 95 + Math.floor(Math.random() * 15);
      g = 128 + Math.floor(Math.random() * 18);
      b = 112 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温声波效应
    if (temp > 700 && Math.random() < 0.03) {
      const dx = Math.random() < 0.5 ? -1 : 1;
      const ny = y - 1;
      if (world.inBounds(x + dx, ny) && world.get(x + dx, ny) === 0) {
        world.set(x + dx, ny, 8);
        world.wakeArea(x + dx, ny);
      }
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇电线升温
      if (nid === 44 && Math.random() < 0.1) {
        world.addTemp(x, y, 18);
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

registerMaterial(ElectrothermalAcousticMaterial);
