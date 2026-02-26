import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蓝片岩 —— 高压低温变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>1600° → 熔岩(11)
 * - 耐酸(9)
 * - 蓝灰色带紫色纹理
 */

export const Blueschist: MaterialDef = {
  id: 334,
  name: '蓝片岩',
  category: '矿石',
  description: '高压低温变质岩，含蓝闪石',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 蓝灰
      r = 80 + Math.floor(Math.random() * 15);
      g = 90 + Math.floor(Math.random() * 15);
      b = 130 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 紫蓝
      r = 95 + Math.floor(Math.random() * 15);
      g = 80 + Math.floor(Math.random() * 12);
      b = 140 + Math.floor(Math.random() * 20);
    } else if (phase < 0.9) {
      // 暗灰蓝
      r = 65 + Math.floor(Math.random() * 12);
      g = 70 + Math.floor(Math.random() * 12);
      b = 100 + Math.floor(Math.random() * 15);
    } else {
      // 浅蓝高光
      r = 110 + Math.floor(Math.random() * 20);
      g = 120 + Math.floor(Math.random() * 20);
      b = 165 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 1600) {
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
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Blueschist);
