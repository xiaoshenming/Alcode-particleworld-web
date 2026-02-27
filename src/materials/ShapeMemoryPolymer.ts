import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 形状记忆聚合物 —— 温度响应智能塑料
 * - 固体，密度 Infinity（常温不可移动）
 * - 低温(<-10°)时变硬变脆：颜色变暗
 * - 常温(20°~60°)为固态
 * - 高温(>60°)时软化：变为可流动的粘稠液体
 * - 极高温(>300°)燃烧
 * - 半透明琥珀色
 */

export const ShapeMemoryPolymer: MaterialDef = {
  id: 265,
  name: '记忆聚合物',
  category: '特殊',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 琥珀色
      r = 200 + Math.floor(Math.random() * 25);
      g = 150 + Math.floor(Math.random() * 20);
      b = 60 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 深琥珀
      r = 180 + Math.floor(Math.random() * 20);
      g = 120 + Math.floor(Math.random() * 20);
      b = 40 + Math.floor(Math.random() * 20);
    } else {
      // 高光
      r = 230 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 20);
      b = 90 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温燃烧
    if (temp > 300) {
      world.set(x, y, 6); // 火
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 高温软化：变为可流动状态
    if (temp > 60) {
      // 向下流动
      if (y < world.height - 1 && world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 斜向下
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        if (world.inBounds(x + d, y + 1) && world.isEmpty(x + d, y + 1)) {
          world.swap(x, y, x + d, y + 1);
          world.markUpdated(x + d, y + 1);
          return;
        }
      }
      // 缓慢横向流动
      if (Math.random() < 0.3) {
        for (const d of [dir, -dir]) {
          if (world.inBounds(x + d, y) && world.isEmpty(x + d, y)) {
            world.swap(x, y, x + d, y);
            world.markUpdated(x + d, y);
            return;
          }
        }
      }
    }

    // 低温变脆：受冲击可能碎裂
    if (temp < -10) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        // 被快速移动的粒子撞击时碎裂
        if (nid === 1 || nid === 58) { // 沙子或陨石
          if (Math.random() < 0.05) {
            world.set(x, y, 0);
            world.wakeArea(x, y);
            return;
          }
        }
      }
    }

    // 检查四邻：导热
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火焰加热
      if (nid === 6 || nid === 11) {
        world.addTemp(x, y, 5);
      }

      // 低导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(ShapeMemoryPolymer);
