import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 沙漠玫瑰 —— 沙漠中的石膏结晶
 * - 固体，不可移动
 * - 沙子(1)接触盐水(24)在干燥环境下缓慢生成
 * - 遇水(2)缓慢溶解为沙子(1)
 * - 高温(>400)碎裂为沙子(1)
 * - 遇酸液(9)溶解
 * - 视觉上呈玫瑰色/沙色花瓣状结晶
 */

export const DesertRose: MaterialDef = {
  id: 120,
  name: '沙漠玫瑰',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.35) {
      // 沙玫瑰色
      r = 210 + Math.floor(Math.random() * 25);
      g = 170 + Math.floor(Math.random() * 25);
      b = 145 + Math.floor(Math.random() * 20);
    } else if (t < 0.6) {
      // 淡粉色
      r = 220 + Math.floor(Math.random() * 20);
      g = 185 + Math.floor(Math.random() * 20);
      b = 170 + Math.floor(Math.random() * 20);
    } else if (t < 0.85) {
      // 沙色
      r = 200 + Math.floor(Math.random() * 25);
      g = 180 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 20);
    } else {
      // 深玫瑰色
      r = 185 + Math.floor(Math.random() * 20);
      g = 140 + Math.floor(Math.random() * 20);
      b = 120 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温碎裂为沙子
    if (temp > 400) {
      world.set(x, y, 1); // 沙子
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    let hasSaltwater = false;
    let hasSand = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 24) hasSaltwater = true;
      if (nid === 1) hasSand = true;

      // 遇酸液溶解
      if (nid === 9 && Math.random() < 0.04) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢溶解
      if (nid === 2 && Math.random() < 0.003) {
        world.set(x, y, 1); // 沙子
        world.wakeArea(x, y);
        return;
      }

      // 遇熔岩碎裂
      if (nid === 11 && Math.random() < 0.1) {
        world.set(x, y, 1);
        world.wakeArea(x, y);
        return;
      }
    }

    // 在盐水+沙子环境下扩展结晶
    if (hasSaltwater && hasSand && Math.random() < 0.002) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.get(nx, ny) === 1 && Math.random() < 0.3) {
          world.set(nx, ny, 120); // 沙漠玫瑰
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          break;
        }
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(DesertRose);
