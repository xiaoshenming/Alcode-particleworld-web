import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声热光材料 —— 声-热-光三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇龙卷风(50)/沙尘暴(84)产生热效应（升温）
 * - 高温(>400°)产生光效应（生成光束(48)）
 * - 深橙棕色带声热纹理
 */

export const AcoustoThermoOpticMaterial: MaterialDef = {
  id: 635,
  name: '声热光材料',
  category: '固体',
  description: '声-热-光三场耦合功能材料，用于声热成像和光声光谱',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 165 + Math.floor(Math.random() * 15);
      g = 88 + Math.floor(Math.random() * 10);
      b = 42 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 148 + Math.floor(Math.random() * 12);
      g = 75 + Math.floor(Math.random() * 8);
      b = 32 + Math.floor(Math.random() * 8);
    } else {
      r = 182 + Math.floor(Math.random() * 15);
      g = 100 + Math.floor(Math.random() * 12);
      b = 52 + Math.floor(Math.random() * 12);
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

      // 遇龙卷风/沙尘暴产生热效应（模拟声→热）
      if ((nid === 50 || nid === 84) && Math.random() < 0.06) {
        world.addTemp(x, y, 15);
        world.wakeArea(x, y);
      }

      // 高温产生光效应（模拟热→光）
      if (temp > 400 && nid === 0 && Math.random() < 0.04) {
        world.set(nx, ny, 48);
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

registerMaterial(AcoustoThermoOpticMaterial);
