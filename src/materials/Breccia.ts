import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 角砾岩 —— 碎屑沉积岩
 * - 固体，密度 Infinity（不可移动）
 * - 耐高温（>1800° 才熔化为熔岩(11)）
 * - 耐酸(9)中等
 * - 棕灰色带角状碎屑纹理
 */

export const Breccia: MaterialDef = {
  id: 349,
  name: '角砾岩',
  category: '矿石',
  description: '碎屑沉积岩，由角状碎屑胶结而成',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 棕灰
      r = 140 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 20);
      b = 105 + Math.floor(Math.random() * 15);
    } else if (phase < 0.65) {
      // 深灰
      r = 110 + Math.floor(Math.random() * 20);
      g = 108 + Math.floor(Math.random() * 18);
      b = 100 + Math.floor(Math.random() * 15);
    } else if (phase < 0.85) {
      // 浅棕碎屑
      r = 165 + Math.floor(Math.random() * 20);
      g = 145 + Math.floor(Math.random() * 18);
      b = 120 + Math.floor(Math.random() * 15);
    } else {
      // 暗色胶结物
      r = 90 + Math.floor(Math.random() * 15);
      g = 85 + Math.floor(Math.random() * 12);
      b = 78 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1800) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.006) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Breccia);
