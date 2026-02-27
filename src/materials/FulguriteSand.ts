import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 闪电沙 —— 玻璃化的沙子（闪电击中沙子形成）
 * - 固体，不可移动
 * - 导电：遇电弧(145)/闪电(16)传导电流
 * - 高温(>1700°)熔化为液态玻璃(92)
 * - 半透明黄绿色，带玻璃质感
 */

/** 电源材质 */
const ELECTRIC = new Set([145, 16]); // 电弧、雷电

export const FulguriteSand: MaterialDef = {
  id: 170,
  name: '闪电沙',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.6) {
      // 黄绿色玻璃质
      r = 160 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 30);
      b = 100 + Math.floor(Math.random() * 30);
    } else {
      // 亮黄高光
      r = 200 + Math.floor(Math.random() * 30);
      g = 220 + Math.floor(Math.random() * 20);
      b = 130 + Math.floor(Math.random() * 30);
    }
    // 半透明
    return (0xCC << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // 高温熔化为液态玻璃
    if (world.getTemp(x, y) > 1700) {
      world.set(x, y, 92); // 液态玻璃
      world.setTemp(x, y, 1000);
      world.wakeArea(x, y);
      return;
    }

    // 刷新颜色（视觉闪烁效果）
    world.set(x, y, 170);

    // 检查邻居：导电
    const dirs = DIRS4;
    let activated = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇电弧/雷电被激活
      if (ELECTRIC.has(nid)) {
        activated = true;
        break;
      }
    }

    // 被激活时：向另一侧传导电弧
    if (activated) {
      world.addTemp(x, y, 30); // 导电升温
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        // 在非电源的空位产生电弧
        if (nid === 0 && Math.random() < 0.3) {
          world.set(nx, ny, 145); // 电弧
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }

        // 传导给相邻闪电沙（加温触发连锁）
        if (nid === 170) {
          world.addTemp(nx, ny, 20);
          world.wakeArea(nx, ny);
        }
      }
    }
  },
};

registerMaterial(FulguriteSand);
