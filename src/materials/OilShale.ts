import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 油页岩 —— 含有机质的沉积岩
 * - 固体，不可移动
 * - 高温(>350)热解释放油(5) + 烟(7)
 * - 遇火(6)缓慢燃烧，产生油(5)和烟(7)
 * - 遇熔岩(11)快速热解
 * - 遇酸液(9)缓慢腐蚀
 * - 视觉上呈深灰褐色层状纹理
 */

export const OilShale: MaterialDef = {
  id: 122,
  name: '油页岩',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 深灰褐色
      r = 85 + Math.floor(Math.random() * 20);
      g = 75 + Math.floor(Math.random() * 15);
      b = 60 + Math.floor(Math.random() * 15);
    } else if (t < 0.7) {
      // 暗褐色
      r = 100 + Math.floor(Math.random() * 20);
      g = 85 + Math.floor(Math.random() * 15);
      b = 65 + Math.floor(Math.random() * 15);
    } else if (t < 0.9) {
      // 灰色层
      r = 110 + Math.floor(Math.random() * 15);
      g = 105 + Math.floor(Math.random() * 15);
      b = 95 + Math.floor(Math.random() * 15);
    } else {
      // 油光斑点
      r = 70 + Math.floor(Math.random() * 15);
      g = 60 + Math.floor(Math.random() * 10);
      b = 45 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温热解
    if (temp > 350) {
      if (Math.random() < 0.05) {
        world.set(x, y, 1); // 残留沙子
        // 释放油到空位
        const dirs: [number, number][] = [[0, -1], [-1, 0], [1, 0]];
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
            world.set(nx, ny, Math.random() < 0.6 ? 5 : 7); // 油或烟
            world.markUpdated(nx, ny);
            world.wakeArea(nx, ny);
            break;
          }
        }
        world.wakeArea(x, y);
        return;
      }
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火缓慢燃烧释放油
      if (nid === 6 && Math.random() < 0.03) {
        // 在空位释放油
        for (const [dx2, dy2] of dirs) {
          const ox = x + dx2, oy = y + dy2;
          if (world.inBounds(ox, oy) && world.isEmpty(ox, oy)) {
            world.set(ox, oy, Math.random() < 0.5 ? 5 : 7);
            world.markUpdated(ox, oy);
            world.wakeArea(ox, oy);
            break;
          }
        }
        world.addTemp(x, y, 5);
        // 有概率消耗自身
        if (Math.random() < 0.02) {
          world.set(x, y, 1); // 残留沙子
          world.wakeArea(x, y);
          return;
        }
      }

      // 遇熔岩快速热解
      if (nid === 11 && Math.random() < 0.1) {
        world.set(x, y, 5); // 变为油
        world.wakeArea(x, y);
        return;
      }

      // 遇酸液腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(OilShale);
