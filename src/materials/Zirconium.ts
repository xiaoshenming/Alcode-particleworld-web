import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 锆 —— 耐高温耐腐蚀金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 1855° → 变为液态锆(287)
 * - 极耐腐蚀：几乎不被酸腐蚀
 * - 高温(>800°)在空气中可燃（接触火/熔岩时）
 * - 银灰色带微蓝光泽
 */

export const Zirconium: MaterialDef = {
  id: 286,
  name: '锆',
  category: '金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银灰
      const base = 175 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 3;
      b = base + 8;
    } else if (phase < 0.7) {
      // 浅灰蓝
      const base = 190 + Math.floor(Math.random() * 15);
      r = base - 3;
      g = base + 2;
      b = base + 10;
    } else {
      // 高光
      const base = 210 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 3;
      b = base + 8;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 1855) {
      world.set(x, y, 287);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 高温可燃（锆粉燃烧）
    if (temp > 800) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if ((nid === 6 || nid === 11) && Math.random() < 0.02) {
          world.set(x, y, 6); // 火
          world.wakeArea(x, y);
          return;
        }
      }
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐腐蚀
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸也难腐蚀
      if ((nid === 173 || nid === 183) && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 中等导热
      if (nid !== 0 && Math.random() < 0.06) {
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

registerMaterial(Zirconium);
