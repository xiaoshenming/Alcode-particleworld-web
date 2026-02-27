import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 磁热声材料 —— 磁-热-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇磁铁(42)附近温度升高
 * - 高温 >600° 产生声波效应（生成蒸汽(8)）
 * - 深靛蓝色带磁性纹理
 */

export const MagnetothermalAcousticMaterial: MaterialDef = {
  id: 535,
  name: '磁热声材料',
  category: '固体',
  description: '磁-热-声三场耦合功能材料，用于磁热声成像和无损检测',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 55 + Math.floor(Math.random() * 12);
      g = 65 + Math.floor(Math.random() * 12);
      b = 128 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 42 + Math.floor(Math.random() * 10);
      g = 52 + Math.floor(Math.random() * 10);
      b = 112 + Math.floor(Math.random() * 12);
    } else {
      r = 68 + Math.floor(Math.random() * 15);
      g = 78 + Math.floor(Math.random() * 15);
      b = 145 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温声波效应
    if (temp > 600 && Math.random() < 0.03) {
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

      // 遇磁铁升温
      if (nid === 42 && Math.random() < 0.08) {
        world.addTemp(x, y, 12);
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

registerMaterial(MagnetothermalAcousticMaterial);
