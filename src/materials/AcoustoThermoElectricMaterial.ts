import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声热电材料 —— 声-热-电三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇蒸汽(8)产生热效应（加温周围）
 * - 遇闪电(16)/电线(44)产生声效应（唤醒周围区域）
 * - 深棕灰色带声热纹理
 */

export const AcoustoThermoElectricMaterial: MaterialDef = {
  id: 595,
  name: '声热电材料',
  category: '固体',
  description: '声-热-电三场耦合功能材料，用于声波热电转换和能量采集',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 118 + Math.floor(Math.random() * 15);
      g = 98 + Math.floor(Math.random() * 10);
      b = 82 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 102 + Math.floor(Math.random() * 12);
      g = 82 + Math.floor(Math.random() * 8);
      b = 68 + Math.floor(Math.random() * 10);
    } else {
      r = 138 + Math.floor(Math.random() * 18);
      g = 115 + Math.floor(Math.random() * 12);
      b = 98 + Math.floor(Math.random() * 15);
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

      // 遇蒸汽产生热效应（模拟声→热）
      if (nid === 8 && Math.random() < 0.06) {
        world.addTemp(x, y, 40);
        world.wakeArea(x, y);
      }

      // 遇闪电/电线唤醒周围（模拟电→声效应）
      if ((nid === 16 || nid === 44) && Math.random() < 0.05) {
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
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

registerMaterial(AcoustoThermoElectricMaterial);
