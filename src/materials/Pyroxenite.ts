import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 辉石岩 —— 深成超基性岩，主要由辉石组成
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1200° → 熔岩(11)
 * - 耐酸(9)：极缓慢溶解
 * - 低导热(0.04)
 * - 深绿色带黑色斑纹
 */

export const Pyroxenite: MaterialDef = {
  id: 324,
  name: '辉石岩',
  category: '矿石',
  description: '深成超基性岩，主要由辉石组成',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深绿基质
      r = 40 + Math.floor(Math.random() * 15);
      g = 60 + Math.floor(Math.random() * 20);
      b = 35 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 黑色斑纹
      r = 25 + Math.floor(Math.random() * 10);
      g = 30 + Math.floor(Math.random() * 10);
      b = 25 + Math.floor(Math.random() * 8);
    } else {
      // 暗橄榄绿
      r = 55 + Math.floor(Math.random() * 15);
      g = 70 + Math.floor(Math.random() * 15);
      b = 40 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1200) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐酸
      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.04) {
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

registerMaterial(Pyroxenite);
