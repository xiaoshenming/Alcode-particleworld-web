import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 电致变色材料 —— 通电变色的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 通电时变色：检测到电线(44)/闪电(16)/电弧(145)时颜色改变
 * - 可燃：高温(>250°)起火
 * - 酸可腐蚀
 * - 默认深蓝灰，通电时变为亮青色
 */

/** 全局通电状态缓存（每帧重置） */
const poweredSet = new Set<number>();
let lastFrame = 0;

export const Electrochromic: MaterialDef = {
  id: 285,
  name: '电致变色材料',
  category: '特殊',
  color() {
    // 默认深蓝灰色（通电状态在 update 中通过 set 刷新颜色）
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 50 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 15);
      b = 75 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 40 + Math.floor(Math.random() * 12);
      g = 48 + Math.floor(Math.random() * 12);
      b = 68 + Math.floor(Math.random() * 15);
    } else {
      // 微光
      r = 60 + Math.floor(Math.random() * 20);
      g = 70 + Math.floor(Math.random() * 20);
      b = 90 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 可燃
    if (temp > 250) {
      world.set(x, y, 6); // 火
      world.wakeArea(x, y);
      return;
    }

    let powered = false;
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 检测电源
      if (nid === 44 || nid === 16 || nid === 145) {
        powered = true;
      }

      // 检测邻近已通电的电致变色材料（链式传导）
      if (nid === 285) {
        const key = ny * world.width + nx;
        if (poweredSet.has(key)) {
          powered = true;
        }
      }

      // 酸腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸
      if ((nid === 173 || nid === 183) && Math.random() < 0.04) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }

    // 帧重置
    const frame = performance.now() | 0;
    if (frame - lastFrame > 50) {
      poweredSet.clear();
      lastFrame = frame;
    }

    if (powered) {
      poweredSet.add(y * world.width + x);
      // 通电变色：刷新为亮青色
      world.set(x, y, 285);
      // 唤醒邻居传导
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) === 285) {
          world.wakeArea(nx, ny);
        }
      }
    }

    // 低导热
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Electrochromic);
