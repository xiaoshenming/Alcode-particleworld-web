import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 热电声材料 —— 热-电-声三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 高温时产生电效应（生成电线(44)碎片）
 * - 遇电线(44)产生振动（生成烟(7)）
 * - 深棕橙色带热电纹理
 */

export const ThermoElectroAcousticMaterial: MaterialDef = {
  id: 720,
  name: '热电声材料',
  category: '固体',
  description: '热-电-声三场耦合功能材料，用于热电发声和声电传感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 165 + Math.floor(Math.random() * 15);
      g = 95 + Math.floor(Math.random() * 10);
      b = 48 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 150 + Math.floor(Math.random() * 12);
      g = 82 + Math.floor(Math.random() * 8);
      b = 35 + Math.floor(Math.random() * 8);
    } else {
      r = 182 + Math.floor(Math.random() * 15);
      g = 108 + Math.floor(Math.random() * 10);
      b = 58 + Math.floor(Math.random() * 10);
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

      // 高温时产生电效应（模拟热→电）
      if (temp > 380 && Math.random() < 0.03) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
          world.wakeArea(x, fy);
        }
      }

      // 遇电线产生振动（模拟电→声）
      if (nid === 44 && Math.random() < 0.035) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 7);
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

registerMaterial(ThermoElectroAcousticMaterial);
