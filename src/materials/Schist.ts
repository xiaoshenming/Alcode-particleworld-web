import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 片岩 —— 中级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 层状结构，有明显的片理
 * - 高温(>900°)熔化为熔岩
 * - 中等耐酸
 * - 灰绿色带银色云母光泽
 */

export const Schist: MaterialDef = {
  id: 284,
  name: '片岩',
  category: '矿石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 灰绿
      r = 80 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 20);
      b = 85 + Math.floor(Math.random() * 15);
    } else if (phase < 0.6) {
      // 暗银灰
      const base = 100 + Math.floor(Math.random() * 20);
      r = base - 5;
      g = base + 5;
      b = base;
    } else if (phase < 0.85) {
      // 深灰绿
      r = 60 + Math.floor(Math.random() * 15);
      g = 75 + Math.floor(Math.random() * 15);
      b = 65 + Math.floor(Math.random() * 12);
    } else {
      // 云母闪光
      const base = 150 + Math.floor(Math.random() * 40);
      r = base - 5;
      g = base + 5;
      b = base + 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 900) {
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

      // 中等耐酸
      if (nid === 9 && Math.random() < 0.012) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸
      if ((nid === 173 || nid === 183) && Math.random() < 0.025) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 低导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Schist);
