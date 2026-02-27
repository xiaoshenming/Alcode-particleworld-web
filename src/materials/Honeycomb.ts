import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 蜂巢 —— 蜜蜂建造的有机结构
 * - 固体，不可移动
 * - 蜂蜜(45)接触时有概率生成蜂巢
 * - 可燃，遇火(6)燃烧产生蜂蜜(45)和烟(7)
 * - 酸液(9)腐蚀
 * - 高温(>150)融化为蜂蜜(45)
 * - 视觉上呈金黄色蜂窝纹理
 */

export const Honeycomb: MaterialDef = {
  id: 107,
  name: '蜂巢',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 金黄色
      r = 210 + Math.floor(Math.random() * 30);
      g = 165 + Math.floor(Math.random() * 25);
      b = 30 + Math.floor(Math.random() * 20);
    } else if (t < 0.8) {
      // 深蜜色
      r = 185 + Math.floor(Math.random() * 25);
      g = 135 + Math.floor(Math.random() * 20);
      b = 20 + Math.floor(Math.random() * 15);
    } else if (t < 0.93) {
      // 蜂蜡浅色
      r = 230 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 20);
      b = 60 + Math.floor(Math.random() * 25);
    } else {
      // 暗色孔洞
      r = 120 + Math.floor(Math.random() * 20);
      g = 85 + Math.floor(Math.random() * 15);
      b = 10 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化为蜂蜜
    if (temp > 150) {
      world.set(x, y, 45); // 蜂蜜
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火燃烧：产生蜂蜜滴落 + 烟
      if (nid === 6 && Math.random() < 0.08) {
        world.set(x, y, Math.random() < 0.6 ? 45 : 7); // 蜂蜜或烟
        world.wakeArea(x, y);
        return;
      }

      // 酸液腐蚀
      if (nid === 9 && Math.random() < 0.06) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 熔岩接触加热
      if (nid === 11) {
        world.addTemp(x, y, 12);
      }

      // 蜂蜜接触时缓慢扩展蜂巢
      if (nid === 45 && Math.random() < 0.003) {
        // 在蜂蜜旁的空位生成新蜂巢
        for (const [dx2, dy2] of dirs) {
          const bx = nx + dx2, by = ny + dy2;
          if (world.inBounds(bx, by) && world.isEmpty(bx, by)) {
            world.set(bx, by, 107); // 蜂巢
            world.markUpdated(bx, by);
            world.wakeArea(bx, by);
            // 消耗蜂蜜
            world.set(nx, ny, 0);
            world.wakeArea(nx, ny);
            break;
          }
        }
        return;
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.04) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Honeycomb);
