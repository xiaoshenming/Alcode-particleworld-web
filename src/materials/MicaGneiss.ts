import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 云母岩 —— 富含云母的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1350° → 熔岩(11)
 * - 耐酸较强（概率0.005）
 * - 导热较慢
 * - 银白色带闪亮云母片
 */

export const MicaGneiss: MaterialDef = {
  id: 394,
  name: '云母岩',
  category: '矿石',
  description: '富含云母的变质岩，银白色带闪亮片状结构，可劈裂成薄片',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 银白色
      const base = 170 + Math.floor(Math.random() * 18);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.6) {
      // 暗灰带微棕
      r = 140 + Math.floor(Math.random() * 12);
      g = 135 + Math.floor(Math.random() * 12);
      b = 128 + Math.floor(Math.random() * 10);
    } else if (phase < 0.85) {
      // 云母闪光（亮银白）
      const base = 200 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 2;
      b = base + 5;
    } else {
      // 金色云母闪光
      r = 210 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 18);
      b = 145 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1350) {
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

registerMaterial(MicaGneiss);
