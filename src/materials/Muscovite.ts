import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 白云母 —— 层状硅酸盐矿物
 * - 固体，高密度，不可移动
 * - 绝缘：阻挡电弧(145)/雷电(16)传播
 * - 耐高温：>1200°才分解
 * - 透光：视觉上半透明
 * - 视觉上呈银白色带珍珠光泽
 */

export const Muscovite: MaterialDef = {
  id: 149,
  name: '白云母',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      r = 210 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 20);
      b = 220 + Math.floor(Math.random() * 15);
    } else if (t < 0.7) {
      // 珍珠光泽
      r = 225 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 15);
      b = 210 + Math.floor(Math.random() * 15);
    } else {
      // 淡金色
      r = 220 + Math.floor(Math.random() * 15);
      g = 210 + Math.floor(Math.random() * 15);
      b = 190 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 1200 && Math.random() < 0.01) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 阻挡电弧/雷电
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 吸收电弧
      if (nid === 145 && Math.random() < 0.5) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 缓慢散热
    if (temp > 25 && Math.random() < 0.05) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Muscovite);
