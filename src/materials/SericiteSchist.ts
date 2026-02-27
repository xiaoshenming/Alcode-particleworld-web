import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 绢云母岩 —— 富含绢云母的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1400° → 熔岩(11)
 * - 耐酸较强（概率0.005）
 * - 导热较慢
 * - 银灰色带丝绢光泽
 */

export const SericiteSchist: MaterialDef = {
  id: 389,
  name: '绢云母岩',
  category: '矿石',
  description: '富含绢云母的变质岩，银灰色带丝绢光泽，质地细腻',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银灰色
      const base = 155 + Math.floor(Math.random() * 18);
      r = base;
      g = base + 3;
      b = base + 6;
    } else if (phase < 0.65) {
      // 暗灰带微绿
      r = 130 + Math.floor(Math.random() * 12);
      g = 135 + Math.floor(Math.random() * 12);
      b = 128 + Math.floor(Math.random() * 10);
    } else if (phase < 0.85) {
      // 丝绢光泽（亮银白）
      const base = 190 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 4;
      b = base + 8;
    } else {
      // 淡金丝绢闪光
      r = 195 + Math.floor(Math.random() * 20);
      g = 188 + Math.floor(Math.random() * 18);
      b = 160 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1400) {
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

      // 耐酸较强
      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 导热较慢
      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(SericiteSchist);
