import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 萤石 —— 受热发荧光的矿石
 * - 固体，不可移动（密度无限）
 * - 常温下呈淡绿/淡紫色
 * - 受热时发出明亮荧光（颜色随温度变化）
 *   - 低温：淡绿色
 *   - 中温：蓝色
 *   - 高温：紫色/粉色
 * - 极高温（>300°）碎裂变为沙子
 * - 雷电击中会短暂强烈发光
 * - 酸液可腐蚀
 */

/** 帧计数器，用于发光闪烁 */
let frameCount = 0;

export const Fluorite: MaterialDef = {
  id: 69,
  name: '萤石',
  color() {
    // 基础色：淡绿紫色矿石
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 淡绿色
      r = 100 + Math.floor(Math.random() * 30);
      g = 180 + Math.floor(Math.random() * 40);
      b = 130 + Math.floor(Math.random() * 30);
    } else if (phase < 0.7) {
      // 淡紫色
      r = 150 + Math.floor(Math.random() * 30);
      g = 110 + Math.floor(Math.random() * 30);
      b = 180 + Math.floor(Math.random() * 40);
    } else {
      // 蓝绿色
      r = 90 + Math.floor(Math.random() * 25);
      g = 160 + Math.floor(Math.random() * 30);
      b = 170 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    frameCount++;
    const temp = world.getTemp(x, y);

    // 极高温碎裂
    if (temp > 300) {
      world.set(x, y, 1); // 沙子
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs = DIRS4;
    let lightningHit = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液腐蚀
      if (nid === 9) {
        world.set(x, y, 0);
        world.set(nx, ny, 0);
        world.wakeArea(x, y);
        return;
      }

      // 雷电击中
      if (nid === 16) {
        lightningHit = true;
      }
    }

    // 发光效果：受热或被雷电击中时刷新颜色
    const glowing = temp > 40 || lightningHit;
    if (glowing) {
      // 刷新颜色以产生发光闪烁效果
      world.set(x, y, 69);
      world.wakeArea(x, y);

      // 向周围传递微弱热量（荧光发热）
      if (temp > 80) {
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (world.inBounds(nx, ny)) {
            world.addTemp(nx, ny, 1);
          }
        }
      }
    }

    // 缓慢散热
    if (temp > 25) {
      world.addTemp(x, y, -0.5);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(Fluorite);
