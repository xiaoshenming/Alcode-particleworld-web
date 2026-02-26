import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛇纹岩化橄榄岩 —— 橄榄岩经蛇纹石化作用形成的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 耐高温（>1500° 才熔化为熔岩(11)）
 * - 耐酸较强（概率低）
 * - 导热较慢
 * - 深绿色带蛇纹花纹
 */

export const SerpentinizedPeridotite2: MaterialDef = {
  id: 384,
  name: '蛇纹岩化橄榄岩',
  category: '矿石',
  description: '橄榄岩经蛇纹石化作用形成的变质岩，深绿色带蛇纹花纹',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 深绿
      r = 50 + Math.floor(Math.random() * 18);
      g = 85 + Math.floor(Math.random() * 22);
      b = 45 + Math.floor(Math.random() * 14);
    } else if (phase < 0.6) {
      // 橄榄绿
      r = 90 + Math.floor(Math.random() * 18);
      g = 108 + Math.floor(Math.random() * 20);
      b = 42 + Math.floor(Math.random() * 12);
    } else if (phase < 0.85) {
      // 暗绿蛇纹
      r = 38 + Math.floor(Math.random() * 14);
      g = 68 + Math.floor(Math.random() * 18);
      b = 38 + Math.floor(Math.random() * 10);
    } else {
      // 浅色脉纹
      r = 155 + Math.floor(Math.random() * 25);
      g = 162 + Math.floor(Math.random() * 20);
      b = 145 + Math.floor(Math.random() * 18);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 1500) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸较强（低概率腐蚀）
      if (nid === 9 && Math.random() < 0.003) {
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

registerMaterial(SerpentinizedPeridotite2);
