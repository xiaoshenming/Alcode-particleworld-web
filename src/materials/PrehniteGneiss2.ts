import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 葡萄石片麻岩(2) —— 第二代含葡萄石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1750° → 熔岩(11)
 * - 耐酸腐蚀（缓慢反应）
 * - 灰绿偏黄色调
 */

export const PrehniteGneiss2: MaterialDef = {
  id: 1049,
  name: '葡萄石片麻岩(2)',
  category: '固体',
  description: '第二代含葡萄石的片麻岩，具有独特的绿色葡萄状矿物',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 20);
      g = 165 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 165 + Math.floor(Math.random() * 10);
      g = 175 + Math.floor(Math.random() * 10);
      b = 150 + Math.floor(Math.random() * 10);
    } else {
      r = 155 + Math.floor(Math.random() * 8);
      g = 165 + Math.floor(Math.random() * 8);
      b = 140 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为熔岩
    if (temp > 1750) {
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

      // 与酸液缓慢反应
      if (nid === 9 && Math.random() < 0.004) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
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

registerMaterial(PrehniteGneiss2);
