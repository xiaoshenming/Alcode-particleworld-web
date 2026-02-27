import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 白云石 —— 碳酸钙镁矿石
 * - 固体，不可移动
 * - 遇酸液(9)反应产生泡泡(73)并缓慢溶解
 * - 高温(>900)分解为沙子(1) + 烟(7)（煅烧）
 * - 遇熔岩(11)直接分解
 * - 遇水(2)表面缓慢风化
 * - 视觉上呈白色带灰色纹理
 */

export const Dolomite: MaterialDef = {
  id: 118,
  name: '白云石',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 白色
      r = 230 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 20);
      b = 220 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 浅灰色
      r = 205 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 20);
      b = 195 + Math.floor(Math.random() * 20);
    } else if (t < 0.9) {
      // 米白色
      r = 225 + Math.floor(Math.random() * 15);
      g = 215 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 15);
    } else {
      // 灰色纹理
      r = 180 + Math.floor(Math.random() * 20);
      g = 175 + Math.floor(Math.random() * 20);
      b = 170 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温煅烧分解
    if (temp > 900) {
      world.set(x, y, 1); // 沙子
      // 上方产生烟
      if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 7); // 烟
        world.markUpdated(x, y - 1);
        world.wakeArea(x, y - 1);
      }
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸液反应产生泡泡
      if (nid === 9 && Math.random() < 0.04) {
        world.set(nx, ny, 73); // 泡泡
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 自身缓慢溶解
        if (Math.random() < 0.3) {
          world.set(x, y, 0);
          world.wakeArea(x, y);
          return;
        }
      }

      // 遇熔岩直接分解
      if (nid === 11 && Math.random() < 0.08) {
        world.set(x, y, 1); // 沙子
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢风化
      if (nid === 2 && Math.random() < 0.001) {
        world.set(x, y, 1); // 风化为沙子
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

registerMaterial(Dolomite);
