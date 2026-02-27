import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 形状记忆陶瓷 —— 温度响应型智能陶瓷
 * - 固体，密度 Infinity（不可移动）
 * - 低温(<0°)变脆：受压碎裂为粉末(沙)
 * - 高温(>300°)软化：可被酸快速腐蚀
 * - 常温极其坚硬
 * - 受热变色：常温白色 → 高温橙红
 * - 高温(>800°)熔化为液态玻璃
 */

export const ShapeMemoryCeramic: MaterialDef = {
  id: 275,
  name: '形状记忆陶瓷',
  category: '特殊',
  description: '温度响应型智能陶瓷，低温变脆高温软化',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 白瓷色
      const base = 220 + Math.floor(Math.random() * 20);
      r = base;
      g = base - 5;
      b = base - 10;
    } else if (phase < 0.8) {
      // 浅灰白
      const base = 200 + Math.floor(Math.random() * 15);
      r = base + 5;
      g = base;
      b = base - 5;
    } else {
      // 微黄光泽
      const base = 210 + Math.floor(Math.random() * 20);
      r = base + 10;
      g = base + 5;
      b = base - 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为液态玻璃
    if (temp > 800) {
      world.set(x, y, 92); // 液态玻璃
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 低温变脆：上方有重物时碎裂
    if (temp < 0) {
      if (y > 0 && !world.isEmpty(x, y - 1) && world.getDensity(x, y - 1) > 2) {
        if (Math.random() < 0.03) {
          world.set(x, y, 1); // 碎裂为沙
          world.wakeArea(x, y);
          return;
        }
      }
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 高温软化时酸腐蚀加速
      if (nid === 9) {
        const rate = temp > 300 ? 0.04 : 0.005;
        if (Math.random() < rate) {
          world.set(x, y, 0);
          world.set(nx, ny, 7);
          world.markUpdated(nx, ny);
          world.wakeArea(x, y);
          return;
        }
      }

      // 强酸
      if ((nid === 173 || nid === 183)) {
        const rate = temp > 300 ? 0.08 : 0.01;
        if (Math.random() < rate) {
          world.set(x, y, 0);
          world.set(nx, ny, 7);
          world.markUpdated(nx, ny);
          world.wakeArea(x, y);
          return;
        }
      }

      // 导热（中等）
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 受热变色：刷新颜色
    if (temp > 200 && Math.random() < 0.1) {
      world.set(x, y, 275);
    }
  },
};

registerMaterial(ShapeMemoryCeramic);
