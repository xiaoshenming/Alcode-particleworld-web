import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 自修复材料 —— 受损后自动修复周围空隙的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 自修复：检测四邻空隙，若空隙另一侧也是自修复材料则概率填充
 * - 高温(>600°)融化为液态玻璃
 * - 耐酸：普通酸概率0.01被消耗
 * - 中等导热
 * - 浅蓝绿色带光泽
 */

export const SelfHealingMaterial: MaterialDef = {
  id: 295,
  name: '自修复材料',
  category: '特殊',
  description: '智能材料，受损后自动修复周围空隙',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 浅蓝绿基色
      r = 120 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 25);
      b = 200 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 青色变体
      r = 100 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 20);
      b = 220 + Math.floor(Math.random() * 20);
    } else {
      // 高光白蓝
      r = 180 + Math.floor(Math.random() * 30);
      g = 235 + Math.floor(Math.random() * 20);
      b = 240 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化为液态玻璃
    if (temp > 600) {
      world.set(x, y, 92); // 液态玻璃
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 自修复：邻居是空气，且空隙另一侧也是自修复材料
      if (nid === 0) {
        const fx = nx + dx, fy = ny + dy;
        if (world.inBounds(fx, fy) && world.get(fx, fy) === 295) {
          if (Math.random() < 0.05) {
            world.set(nx, ny, 295);
            world.markUpdated(nx, ny);
            world.wakeArea(nx, ny);
          }
        }
      }

      // 耐酸：普通酸概率0.01，酸被消耗变烟
      if (nid === 9 && Math.random() < 0.01) {
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        return;
      }

      // 中等导热
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(SelfHealingMaterial);
