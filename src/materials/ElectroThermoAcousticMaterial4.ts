import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电热声材料(4) —— 第四代电热声复合材料
 * - 固体，密度 Infinity（不可移动）
 * - 遇电线(44)概率0.04产生热量+40
 * - 遇磁铁(42)概率0.04在上方生成火花(28)
 * - 温度差>5时传导温度系数0.07
 * - 暗灰蓝紫色
 */

export const ElectroThermoAcousticMaterial4: MaterialDef = {
  id: 1040,
  name: '电热声材料(4)',
  category: '固体',
  description: '第四代电热声复合材料，具有增强的电热声耦合效应',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 140 + Math.floor(Math.random() * 20);
      g = 135 + Math.floor(Math.random() * 20);
      b = 158 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 150 + Math.floor(Math.random() * 10);
      g = 145 + Math.floor(Math.random() * 10);
      b = 168 + Math.floor(Math.random() * 10);
    } else {
      r = 140 + Math.floor(Math.random() * 8);
      g = 135 + Math.floor(Math.random() * 8);
      b = 158 + Math.floor(Math.random() * 8);
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

      // 与电线接触产生热量
      if (nid === 44 && Math.random() < 0.04) {
        world.addTemp(x, y, 40);
        world.wakeArea(x, y);
      }

      // 与磁铁接触在上方生成火花
      if (nid === 42 && Math.random() < 0.04) {
        const fy = y - 1;
        if (world.inBounds(x, fy) && world.get(x, fy) === 0) {
          world.set(x, fy, 28);
          world.wakeArea(x, fy);
        }
      }

      // 温度传导
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

registerMaterial(ElectroThermoAcousticMaterial4);
