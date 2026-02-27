import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 忆阻器材料 —— 记忆电阻材料
 * - 固体，密度 Infinity（不可移动）
 * - 通电变色：接触电线(44)/闪电(16)/电弧(145)时，刷新自身颜色
 * - 高温(>500°) → 变为烟(7)
 * - 耐酸：普通酸(9)概率0.01，酸被消耗变烟(7)
 * - 中等导热(概率0.05)：与邻居温差>8时传导(0.06)
 * - 暗紫色带金属光泽
 */

export const Memristor: MaterialDef = {
  id: 300,
  name: '忆阻器材料',
  category: '特殊',
  description: '记忆电阻材料，通电后改变颜色状态',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.45) {
      // 暗紫色
      r = 75 + Math.floor(Math.random() * 20);
      g = 30 + Math.floor(Math.random() * 15);
      b = 90 + Math.floor(Math.random() * 20);
    } else if (phase < 0.75) {
      // 深紫蓝
      r = 55 + Math.floor(Math.random() * 15);
      g = 35 + Math.floor(Math.random() * 15);
      b = 110 + Math.floor(Math.random() * 25);
    } else {
      // 高光亮紫（金属光泽）
      r = 120 + Math.floor(Math.random() * 30);
      g = 60 + Math.floor(Math.random() * 25);
      b = 140 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解为烟
    if (temp > 500) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    let powered = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 通电变色：接触电线/闪电/电弧
      if (nid === 44 || nid === 16 || nid === 145) {
        powered = true;
      }

      // 耐酸：普通酸(9)概率0.01，酸被消耗变烟
      if (nid === 9 && Math.random() < 0.01) {
        world.set(nx, ny, 7); // 酸变烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 中等导热（概率0.05）：温差>8时传导
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 通电时刷新自身颜色（重新调用 color()）
    if (powered) {
      world.set(x, y, 300);
    }
  },
};

registerMaterial(Memristor);
