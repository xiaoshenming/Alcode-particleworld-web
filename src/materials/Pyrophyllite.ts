import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 叶蜡石 —— 层状硅酸盐矿物
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>2000° → 熔岩(11)
 * - 耐酸(9)
 * - 浅黄绿色带层状纹理
 */

export const Pyrophyllite: MaterialDef = {
  id: 369,
  name: '叶蜡石',
  category: '矿石',
  description: '层状硅酸盐矿物，耐高温，用于陶瓷和耐火材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 浅黄绿
      r = 185 + Math.floor(Math.random() * 15);
      g = 195 + Math.floor(Math.random() * 15);
      b = 140 + Math.floor(Math.random() * 12);
    } else if (phase < 0.7) {
      // 暗黄绿
      r = 165 + Math.floor(Math.random() * 12);
      g = 175 + Math.floor(Math.random() * 12);
      b = 120 + Math.floor(Math.random() * 10);
    } else if (phase < 0.9) {
      // 灰黄绿
      r = 175 + Math.floor(Math.random() * 10);
      g = 180 + Math.floor(Math.random() * 10);
      b = 135 + Math.floor(Math.random() * 10);
    } else {
      // 浅绿高光
      r = 200 + Math.floor(Math.random() * 18);
      g = 210 + Math.floor(Math.random() * 18);
      b = 160 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 2000) {
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

      // 耐酸
      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Pyrophyllite);
