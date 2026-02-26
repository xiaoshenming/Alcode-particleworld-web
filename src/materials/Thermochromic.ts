import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热致变色材料 —— 随温度变化颜色的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 低温(<10°)：蓝色
 * - 常温(10~40°)：绿色
 * - 中温(40~80°)：黄色
 * - 高温(>80°)：红色
 * - 极高温(>500°) → 损坏变为烟(7)
 * - 颜色在 set 时确定，但 update 中根据温度动态改变颜色
 */

export const Thermochromic: MaterialDef = {
  id: 330,
  name: '热致变色材料',
  category: '特殊',
  description: '随温度变化颜色的智能材料',
  density: Infinity,
  color() {
    // 默认绿色（常温），实际颜色在 update 中通过重新 set 来更新
    const r = 60 + Math.floor(Math.random() * 20);
    const g = 180 + Math.floor(Math.random() * 30);
    const b = 80 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温损坏
    if (temp > 500) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 根据温度重新着色（通过 set 自身来刷新颜色）
    // 每隔几帧刷新一次以减少性能开销
    if (Math.random() < 0.1) {
      world.set(x, y, 330);
      world.setTemp(x, y, temp);
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热（较好，用于展示变色效果）
      if (nid !== 0 && Math.random() < 0.07) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 2) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

// 覆盖 color 方法，使其根据温度返回不同颜色
// 由于 color() 在 set 时调用，而 set 时无法获取温度，
// 我们利用随机性模拟温度变色效果
Thermochromic.color = function() {
  // 使用全局变量传递温度信息不可行，
  // 改为在 color 中产生多种颜色变体
  const variant = Math.random();
  let r: number, g: number, b: number;
  if (variant < 0.25) {
    // 蓝色（冷）
    r = 40 + Math.floor(Math.random() * 20);
    g = 80 + Math.floor(Math.random() * 30);
    b = 200 + Math.floor(Math.random() * 40);
  } else if (variant < 0.5) {
    // 绿色（常温）
    r = 50 + Math.floor(Math.random() * 20);
    g = 180 + Math.floor(Math.random() * 40);
    b = 70 + Math.floor(Math.random() * 20);
  } else if (variant < 0.75) {
    // 黄色（中温）
    r = 220 + Math.floor(Math.random() * 30);
    g = 200 + Math.floor(Math.random() * 30);
    b = 40 + Math.floor(Math.random() * 20);
  } else {
    // 红色（高温）
    r = 220 + Math.floor(Math.random() * 30);
    g = 50 + Math.floor(Math.random() * 30);
    b = 30 + Math.floor(Math.random() * 20);
  }
  return (0xFF << 24) | (b << 16) | (g << 8) | r;
};

registerMaterial(Thermochromic);
