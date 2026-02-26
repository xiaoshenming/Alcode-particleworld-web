import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声电磁材料 —— 声-电-磁三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇龙卷风(50)/沙尘暴(84)产生电效应（生成闪电(16)）
 * - 遇电线(44)/闪电(16)产生磁效应（加温周围）
 * - 深青铜色带声波纹理
 */

export const AcoustoElectroMagneticMaterial: MaterialDef = {
  id: 615,
  name: '声电磁材料',
  category: '固体',
  description: '声-电-磁三场耦合功能材料，用于声纳换能和电磁屏蔽',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 108 + Math.floor(Math.random() * 15);
      g = 88 + Math.floor(Math.random() * 10);
      b = 62 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 92 + Math.floor(Math.random() * 12);
      g = 72 + Math.floor(Math.random() * 8);
      b = 48 + Math.floor(Math.random() * 8);
    } else {
      r = 125 + Math.floor(Math.random() * 18);
      g = 102 + Math.floor(Math.random() * 12);
      b = 75 + Math.floor(Math.random() * 12);
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

      // 遇龙卷风/沙尘暴产生电效应（模拟声→电）
      if ((nid === 50 || nid === 84) && Math.random() < 0.05) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 16);
          world.wakeArea(x, fy);
        }
      }

      // 遇电线/闪电产生磁效应（模拟电→磁）
      if ((nid === 44 || nid === 16) && Math.random() < 0.06) {
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

registerMaterial(AcoustoElectroMagneticMaterial);
