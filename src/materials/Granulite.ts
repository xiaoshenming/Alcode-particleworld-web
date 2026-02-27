import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 麻粒岩 —— 高级变质岩，深部地壳常见
 * - 固体，密度 Infinity（不可移动）
 * - 极高温(>1150°) → 熔化为熔岩(11)
 * - 耐酸：普通酸概率0.004
 * - 低导热(0.03)
 * - 深灰绿到暗褐色，粒状结构
 */

export const Granulite: MaterialDef = {
  id: 309,
  name: '麻粒岩',
  category: '矿石',
  description: '高级变质岩，深部地壳常见岩石',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰绿
      r = 70 + Math.floor(Math.random() * 15);
      g = 80 + Math.floor(Math.random() * 15);
      b = 65 + Math.floor(Math.random() * 12);
    } else if (phase < 0.7) {
      // 暗褐
      r = 90 + Math.floor(Math.random() * 15);
      g = 70 + Math.floor(Math.random() * 12);
      b = 55 + Math.floor(Math.random() * 10);
    } else if (phase < 0.9) {
      // 中灰
      const base = 95 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 3;
      b = base + 5;
    } else {
      // 浅色矿物颗粒
      r = 140 + Math.floor(Math.random() * 25);
      g = 135 + Math.floor(Math.random() * 20);
      b = 120 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温融化
    if (temp > 1150) {
      world.set(x, y, 11);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸
      if (nid === 9 && Math.random() < 0.004) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 强酸
      if ((nid === 173 || nid === 183) && Math.random() < 0.009) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 低导热
    if (Math.random() < 0.025) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        if (Math.abs(temp - nTemp) > 10) {
          const transfer = (nTemp - temp) * 0.03;
          world.addTemp(x, y, transfer);
          world.addTemp(nx, ny, -transfer);
        }
      }
    }
  },
};

registerMaterial(Granulite);
