import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 橡皮泥 —— 可塑性固体
 * - 受重力影响缓慢下落
 * - 不像沙子散开，会粘在一起（只直接下落，不斜下）
 * - 遇到同类邻居时停止运动（粘性）
 * - 可被高温融化
 */
export const Putty: MaterialDef = {
  id: 29,
  name: '橡皮泥',
  color() {
    const base = Math.random();
    // 彩色橡皮泥：随机偏向红/绿/蓝
    const palette = Math.floor(Math.random() * 3);
    let r: number, g: number, b: number;
    if (palette === 0) {
      // 粉红
      r = 220 + Math.floor(base * 30);
      g = 100 + Math.floor(base * 30);
      b = 140 + Math.floor(base * 30);
    } else if (palette === 1) {
      // 绿色
      r = 80 + Math.floor(base * 30);
      g = 200 + Math.floor(base * 40);
      b = 100 + Math.floor(base * 30);
    } else {
      // 蓝紫
      r = 120 + Math.floor(base * 30);
      g = 100 + Math.floor(base * 30);
      b = 210 + Math.floor(base * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4,
  update(x: number, y: number, world: WorldAPI) {
    // 高温融化为液体（变成水的行为）
    if (world.getTemp(x, y) > 150) {
      world.set(x, y, 0); // 融化消失
      world.set(x, y, 7); // 变成烟
      return;
    }

    if (y >= world.height - 1) return;

    // 粘性检测：如果下方有同类橡皮泥，停止运动
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 29) {
      // 检查是否有支撑（下方的橡皮泥链最终接触地面或固体）
      return;
    }

    // 缓慢下落（比沙子慢）
    if (Math.random() < 0.6) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 密度置换：沉入轻液体
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < Putty.density && belowDensity < Infinity) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 不斜下散开 — 这是橡皮泥和沙子的关键区别
    // 但如果两侧都有空间且下方被堵，允许极低概率斜下（模拟缓慢变形）
    if (Math.random() < 0.05) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
      }
    }
  },
};

registerMaterial(Putty);
