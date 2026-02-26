import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热电声材料 —— 热-电-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>500°)产生电效应（生成闪电(16)）
 * - 遇电线(44)/闪电(16)产生声效应（生成龙卷风(50)）
 * - 深赤铜色带热电纹理
 */

export const ThermoElectroSonicMaterial: MaterialDef = {
  id: 650,
  name: '热电声材料',
  category: '固体',
  description: '热-电-声三场耦合功能材料，用于热电发电和声波传感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 15);
      g = 68 + Math.floor(Math.random() * 10);
      b = 48 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 140 + Math.floor(Math.random() * 12);
      g = 55 + Math.floor(Math.random() * 8);
      b = 38 + Math.floor(Math.random() * 8);
    } else {
      r = 172 + Math.floor(Math.random() * 15);
      g = 80 + Math.floor(Math.random() * 12);
      b = 58 + Math.floor(Math.random() * 12);
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

      // 高温产生电效应（模拟热→电）
      if (temp > 500 && nid === 0 && Math.random() < 0.03) {
        world.set(nx, ny, 16);
        world.wakeArea(nx, ny);
      }

      // 遇电线/闪电产生声效应（模拟电→声）
      if ((nid === 44 || nid === 16) && Math.random() < 0.05) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 50);
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

registerMaterial(ThermoElectroSonicMaterial);
