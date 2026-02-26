import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热声电材料 —— 热-声-电三场耦合功能材料
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >800° 发出声波（生成蒸汽(8)模拟声波）
 * - 遇电线(44)传导能量
 * - 深青铜色带电弧纹理
 */

export const ThermoAcoustoElectricMaterial: MaterialDef = {
  id: 530,
  name: '热声电材料',
  category: '固体',
  description: '热-声-电三场耦合功能材料，用于能量转换和传感器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 85 + Math.floor(Math.random() * 15);
      g = 115 + Math.floor(Math.random() * 15);
      b = 125 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 70 + Math.floor(Math.random() * 12);
      g = 100 + Math.floor(Math.random() * 12);
      b = 115 + Math.floor(Math.random() * 12);
    } else {
      r = 100 + Math.floor(Math.random() * 18);
      g = 135 + Math.floor(Math.random() * 18);
      b = 148 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温声波效应
    if (temp > 800 && Math.random() < 0.03) {
      const dx = Math.random() < 0.5 ? -1 : 1;
      const ny = y - 1;
      if (world.inBounds(x + dx, ny) && world.get(x + dx, ny) === 0) {
        world.set(x + dx, ny, 8);
        world.wakeArea(x + dx, ny);
      }
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇电线传导
      if (nid === 44 && temp > 200 && Math.random() < 0.1) {
        world.addTemp(nx, ny, 15);
        world.addTemp(x, y, -10);
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

registerMaterial(ThermoAcoustoElectricMaterial);
