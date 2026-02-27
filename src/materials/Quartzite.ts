import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 石英岩 —— 高级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 由石英砂岩变质而成，极硬
 * - 高温(>1200°)熔化为熔岩
 * - 极耐酸
 * - 白灰色带玻璃光泽
 */

export const Quartzite: MaterialDef = {
  id: 289,
  name: '石英岩',
  category: '矿石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 白灰
      const base = 190 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.6) {
      // 浅粉灰
      const base = 180 + Math.floor(Math.random() * 20);
      r = base + 10;
      g = base;
      b = base + 3;
    } else if (phase < 0.85) {
      // 浅黄灰
      const base = 175 + Math.floor(Math.random() * 20);
      r = base + 8;
      g = base + 5;
      b = base - 5;
    } else {
      // 玻璃光泽高光
      const base = 220 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 2;
      b = base + 5;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1200) {
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

      // 极耐酸
      if (nid === 9 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸
      if ((nid === 173 || nid === 183) && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 低导热
      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.03;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Quartzite);
