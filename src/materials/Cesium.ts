import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铯 —— 极活泼碱金属
 * - 固体，密度 Infinity（不可移动）
 * - 极低熔点：>28° → 液态铯(437)
 * - 遇水剧烈爆炸
 * - 金黄色光泽
 */

export const Cesium: MaterialDef = {
  id: 436,
  name: '铯',
  category: '金属',
  description: '极活泼碱金属，金黄色，遇水剧烈爆炸',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 210 + Math.floor(Math.random() * 20);
      g = 185 + Math.floor(Math.random() * 15);
      b = 80 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 225 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 12);
      b = 95 + Math.floor(Math.random() * 15);
    } else {
      r = 240 + Math.floor(Math.random() * 15);
      g = 215 + Math.floor(Math.random() * 10);
      b = 110 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极低熔点
    if (temp > 28) {
      world.set(x, y, 437);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水爆炸
      if (nid === 2 && Math.random() < 0.8) {
        world.set(x, y, 6); // 火
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, 600);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇酸反应
      if (nid === 9 && Math.random() < 0.3) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.addTemp(nx, ny, 200);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 3) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Cesium);
