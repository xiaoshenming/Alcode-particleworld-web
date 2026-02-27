import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 辉钼矿 —— 含钼的层状矿物
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1185° → 熔岩(11)
 * - 耐酸较弱（概率0.012）
 * - 导热中等
 * - 铅灰色带金属光泽，层状纹理
 */

export const Molybdenite: MaterialDef = {
  id: 419,
  name: '辉钼矿',
  category: '矿石',
  description: '含钼的层状硫化物矿物，铅灰色金属光泽，是钼的主要矿石',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 铅灰色
      r = 130 + Math.floor(Math.random() * 18);
      g = 135 + Math.floor(Math.random() * 15);
      b = 142 + Math.floor(Math.random() * 12);
    } else if (phase < 0.65) {
      // 暗灰
      r = 105 + Math.floor(Math.random() * 12);
      g = 110 + Math.floor(Math.random() * 10);
      b = 118 + Math.floor(Math.random() * 10);
    } else if (phase < 0.85) {
      // 亮银灰（金属光泽）
      r = 165 + Math.floor(Math.random() * 18);
      g = 170 + Math.floor(Math.random() * 15);
      b = 178 + Math.floor(Math.random() * 12);
    } else {
      // 蓝灰色调
      r = 115 + Math.floor(Math.random() * 12);
      g = 122 + Math.floor(Math.random() * 10);
      b = 140 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1185) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸较弱
      if (nid === 9 && Math.random() < 0.012) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热中等
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Molybdenite);
