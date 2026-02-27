import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 黏液 —— 弹性半液体
 * - 受重力影响，流动极慢（比凝胶更粘）
 * - 弹性：粒子落到黏液上会被弹起（向上推）
 * - 可粘附：小粒子接触黏液后被困住
 * - 遇火燃烧产生毒气
 * - 遇水缓慢溶解
 * - 酸液快速溶解
 * - 视觉上呈亮绿色半透明
 */

/** 可被黏液弹起的轻粒子 */
const BOUNCEABLE = new Set([1, 15, 23, 28, 79]); // 沙、雪、盐、火花、钠

/** 可被黏液困住的小粒子 */
const TRAPPABLE = new Set([40, 52, 81]); // 蚂蚁、萤火虫、白蚁

export const Slime: MaterialDef = {
  id: 89,
  name: '黏液',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 亮绿色
      r = 50 + Math.floor(Math.random() * 20);
      g = 190 + Math.floor(Math.random() * 40);
      b = 40 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 深绿色
      r = 30 + Math.floor(Math.random() * 15);
      g = 150 + Math.floor(Math.random() * 30);
      b = 25 + Math.floor(Math.random() * 15);
    } else {
      // 黄绿高光
      r = 80 + Math.floor(Math.random() * 30);
      g = 210 + Math.floor(Math.random() * 30);
      b = 50 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.8, // 比水重
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温燃烧产生毒气
    if (temp > 120 && Math.random() < 0.06) {
      world.set(x, y, 18); // 毒气
      world.wakeArea(x, y);
      return;
    }

    // 遇火直接燃烧
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火燃烧
      if (nid === 6 && Math.random() < 0.1) {
        world.set(x, y, 6); // 火
        world.setTemp(x, y, 150);
        world.wakeArea(x, y);
        return;
      }

      // 酸液快速溶解
      if (nid === 9 && Math.random() < 0.08) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢溶解
      if (nid === 2 && Math.random() < 0.005) {
        world.set(x, y, 2); // 变为水
        world.wakeArea(x, y);
        return;
      }

      // 弹起效果：上方有可弹粒子时向上推
      if (dy === -1 && BOUNCEABLE.has(nid) && Math.random() < 0.2) {
        const bounceY = ny - 1;
        if (world.inBounds(nx, bounceY) && world.isEmpty(nx, bounceY)) {
          world.swap(nx, ny, nx, bounceY);
          world.wakeArea(nx, ny);
          world.wakeArea(nx, bounceY);
        }
      }

      // 困住小生物
      if (TRAPPABLE.has(nid) && Math.random() < 0.15) {
        world.set(nx, ny, 89); // 吞噬
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 极缓慢重力下落
    if (y + 1 < world.height && Math.random() < 0.08) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 斜下滑落
      if (Math.random() < 0.2) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        for (const d of [dir, -dir]) {
          const nx = x + d;
          if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1) && world.isEmpty(nx, y)) {
            world.swap(x, y, nx, y + 1);
            world.wakeArea(x, y);
            world.wakeArea(nx, y + 1);
            return;
          }
        }
      }
    }

    // 极缓慢水平扩散
    if (Math.random() < 0.02) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

registerMaterial(Slime);
