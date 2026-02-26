import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声热电材料(2) —— 声-热-电三场耦合功能材料变种
 * - 固体，密度 Infinity（不可移动）
 * - 遇龙卷风(50)升温（模拟声→热）
 * - 高温>340时产生电效应（生成火花(28)）
 * - 深灰棕色带声热纹理
 */

export const AcoustoThermoElectricMaterial2: MaterialDef = {
  id: 740,
  name: '声热电材料(2)',
  category: '固体',
  description: '声-热-电三场耦合功能材料变种，用于声能采集和热电转换',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 112 + Math.floor(Math.random() * 12);
      g = 95 + Math.floor(Math.random() * 10);
      b = 82 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 125 + Math.floor(Math.random() * 10);
      g = 108 + Math.floor(Math.random() * 10);
      b = 95 + Math.floor(Math.random() * 10);
    } else {
      r = 100 + Math.floor(Math.random() * 12);
      g = 85 + Math.floor(Math.random() * 10);
      b = 72 + Math.floor(Math.random() * 10);
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

      // 遇龙卷风升温（模拟声→热）
      if (nid === 50 && Math.random() < 0.04) {
        world.addTemp(x, y, 30);
        world.wakeArea(x, y);
      }

      // 高温时产生电效应（模拟热→电）
      if (temp > 340 && Math.random() < 0.03) {
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

registerMaterial(AcoustoThermoElectricMaterial2);
