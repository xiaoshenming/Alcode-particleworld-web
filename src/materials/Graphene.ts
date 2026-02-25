import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 石墨烯 —— 超薄超强碳材料
 * - 固体，密度 Infinity（不可移动）
 * - 极高强度：不被爆炸破坏，不被酸腐蚀
 * - 优异导热性：快速传导温度到邻居
 * - 超高温(>3600°)才会燃烧（碳的升华温度）
 * - 深灰色带微微紫色光泽
 */

export const Graphene: MaterialDef = {
  id: 209,
  name: '石墨烯',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 深灰色
      const base = 50 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.85) {
      // 微紫色光泽
      const base = 60 + Math.floor(Math.random() * 15);
      r = base + 10;
      g = base;
      b = base + 20;
    } else {
      // 高光反射
      const base = 80 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 3;
      b = base + 8;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超高温燃烧（碳升华）
    if (temp > 3600) {
      world.set(x, y, 7); // 变为烟（CO₂）
      world.setTemp(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 优异导热性：快速向邻居传导温度
    if (temp > 25) {
      const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        const diff = temp - nTemp;
        if (diff > 5) {
          // 快速传导（导热系数极高）
          const transfer = diff * 0.3;
          world.addTemp(nx, ny, transfer);
          world.addTemp(x, y, -transfer);
          world.wakeArea(nx, ny);
        }
      }
    }

    // 缓慢自然散热
    if (temp > 20 && Math.random() < 0.01) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Graphene);
