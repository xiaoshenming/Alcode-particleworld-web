import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 光热声材料 —— 光-热-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇激光(47)/光束(48)升温
 * - 高温 >500° 产生声波效应（生成蒸汽(8)）
 * - 琥珀橙色带光泽纹理
 */

export const PhotothermalAcousticMaterial: MaterialDef = {
  id: 545,
  name: '光热声材料',
  category: '固体',
  description: '光-热-声三场耦合功能材料，用于光声成像和无损检测',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 198 + Math.floor(Math.random() * 15);
      g = 138 + Math.floor(Math.random() * 12);
      b = 58 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 182 + Math.floor(Math.random() * 12);
      g = 122 + Math.floor(Math.random() * 10);
      b = 42 + Math.floor(Math.random() * 10);
    } else {
      r = 215 + Math.floor(Math.random() * 18);
      g = 155 + Math.floor(Math.random() * 15);
      b = 72 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温声波效应
    if (temp > 500 && Math.random() < 0.03) {
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

      // 遇激光/光束升温
      if ((nid === 47 || nid === 48) && Math.random() < 0.15) {
        world.addTemp(x, y, 20);
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

registerMaterial(PhotothermalAcousticMaterial);
