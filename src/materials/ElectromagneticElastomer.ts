import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电磁弹性材料 —— 电磁场下变形的智能聚合物
 * - 轻质固体，密度 1.4（受重力下落）
 * - 接触电弧(145)/电线(44)时膨胀（向空位扩展）
 * - 接触火(6)时燃烧
 * - 接触水缓慢溶胀
 * - 深棕色带橙色光泽
 */

export const ElectromagneticElastomer: MaterialDef = {
  id: 420,
  name: '电磁弹性材料',
  category: '特殊',
  description: '电磁场下可变形的智能聚合物，接触电弧时膨胀扩展',
  density: 1.4,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深棕橙
      r = 140 + Math.floor(Math.random() * 20);
      g = 90 + Math.floor(Math.random() * 15);
      b = 55 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗棕
      r = 115 + Math.floor(Math.random() * 15);
      g = 72 + Math.floor(Math.random() * 12);
      b = 42 + Math.floor(Math.random() * 10);
    } else {
      // 亮橙光泽
      r = 175 + Math.floor(Math.random() * 18);
      g = 115 + Math.floor(Math.random() * 15);
      b = 65 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火燃烧
      if (nid === 6 && Math.random() < 0.06) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }

      // 接触电弧/电线时膨胀（向空位扩展自身）
      if ((nid === 145 || nid === 44) && Math.random() < 0.12) {
        for (const [dx2, dy2] of dirs) {
          const ex = x + dx2, ey = y + dy2;
          if (world.inBounds(ex, ey) && world.isEmpty(ex, ey)) {
            world.set(ex, ey, 420);
            world.wakeArea(ex, ey);
            break;
          }
        }
        world.wakeArea(x, y);
        return;
      }

      // 接触水缓慢溶胀（也是膨胀）
      if (nid === 2 && Math.random() < 0.02) {
        world.set(nx, ny, 420); // 水变成自身
        world.wakeArea(nx, ny);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 高温分解
    if (temp > 250) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // === 轻固体运动（受重力下落） ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 1.4) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下滑落
    if (y < world.height - 1 && Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(ElectromagneticElastomer);
