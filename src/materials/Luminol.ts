import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磷光体 —— 化学发光液体
 * - 液体，密度 1.8，流动性好
 * - 持续发光，颜色随时间脉动（蓝绿色）
 * - 遇血液(87)发出更亮的蓝光（法医鲁米诺检测效果）
 * - 遇酸液(9)分解为空气
 * - 蓝绿色发光液体
 */

export const Luminol: MaterialDef = {
  id: 171,
  name: '磷光体',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 蓝绿色基调
      r = 20 + Math.floor(Math.random() * 30);
      g = 120 + Math.floor(Math.random() * 50);
      b = 200 + Math.floor(Math.random() * 40);
    } else if (phase < 0.7) {
      // 偏青色脉动
      r = 30 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 40);
      b = 220 + Math.floor(Math.random() * 35);
    } else {
      // 亮蓝高光（脉动峰值）
      r = 80 + Math.floor(Math.random() * 40);
      g = 200 + Math.floor(Math.random() * 30);
      b = 240 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.8,
  update(x: number, y: number, world: WorldAPI) {
    // 颜色脉动：定期刷新保持发光动态
    if (Math.random() < 0.08) {
      world.set(x, y, 171);
    }

    // 邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇血液：发出更亮的蓝光（法医检测效果）
      // 将血液转化为火花表示强烈蓝色荧光闪烁
      if (nid === 87 && Math.random() < 0.1) {
        world.set(nx, ny, 28); // 火花（明亮闪光）
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 自身也刷新颜色（变亮）
        world.set(x, y, 171);
        world.wakeArea(x, y);
      }

      // 遇酸液：分解为空气
      if (nid === 9 && Math.random() < 0.08) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇火蒸发
      if (nid === 6 && Math.random() < 0.1) {
        world.set(x, y, 8); // 蒸汽
        world.wakeArea(x, y);
        return;
      }
    }

    // 重力下落
    if (y + 1 < world.height) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 密度置换（沉入比自己轻的液体下方）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < Luminol.density && belowDensity < Infinity) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下流动
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }

    // 水平流动
    if (Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

registerMaterial(Luminol);
