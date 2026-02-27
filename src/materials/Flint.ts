import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 燧石 —— 可打火的硅质岩石
 * - 固体，密度 Infinity（不可移动）
 * - 打火效果：与金属(10)/铁锈(72)碰撞时产生火花(28)
 * - 高硬度：耐酸腐蚀
 * - 高温(>1000°)碎裂为沙子(1)
 * - 深灰色带贝壳状断口光泽
 */

export const Flint: MaterialDef = {
  id: 254,
  name: '燧石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰色
      const base = 55 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.7) {
      // 暗褐灰
      r = 65 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 12);
      b = 50 + Math.floor(Math.random() * 12);
    } else if (phase < 0.9) {
      // 中灰
      const base = 75 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 1;
      b = base + 3;
    } else {
      // 贝壳状断口光泽
      const base = 100 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 5;
      b = base + 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温碎裂
    if (temp > 1000) {
      world.set(x, y, 1); // 沙子
      world.setTemp(x, y, temp * 0.4);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 与金属碰撞产生火花
      if ((nid === 10 || nid === 72 || nid === 85 || nid === 246) && Math.random() < 0.008) {
        // 在空位生成火花
        for (const [sx, sy] of dirs) {
          const sparkX = x + sx, sparkY = y + sy;
          if (world.inBounds(sparkX, sparkY) && world.isEmpty(sparkX, sparkY)) {
            world.set(sparkX, sparkY, 28); // 火花
            world.markUpdated(sparkX, sparkY);
            world.wakeArea(sparkX, sparkY);
            break;
          }
        }
      }

      // 耐酸（酸蒸发）
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.005) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 仅氟化氢可腐蚀
      if (nid === 208 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Flint);
