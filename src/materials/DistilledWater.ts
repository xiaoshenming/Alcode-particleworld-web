import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蒸馏水 —— 纯净水
 * - 液体，密度与水相同
 * - 不导电：接触电线不产生反应（区别于普通水）
 * - 可溶解盐(23)变成盐水(24)
 * - 可溶解干冰(65)变成冒泡的冷水
 * - 高温蒸发为蒸汽，低温结冰
 * - 视觉上比普通水更清澈透明
 */

export const DistilledWater: MaterialDef = {
  id: 97,
  name: '蒸馏水',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.7) {
      // 清澈淡蓝
      r = 180 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 240 + Math.floor(Math.random() * 15);
    } else {
      // 高光白
      r = 200 + Math.floor(Math.random() * 30);
      g = 225 + Math.floor(Math.random() * 20);
      b = 250 + Math.floor(Math.random() * 5);
    }
    // 半透明
    return (0xD0 << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发
    if (temp > 100) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    // 低温结冰
    if (temp < -5 && Math.random() < 0.05) {
      world.set(x, y, 14); // 冰
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 溶解盐 → 盐水
      if (nid === 23 && Math.random() < 0.08) {
        world.set(x, y, 24); // 盐水
        world.set(nx, ny, 0);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 溶解干冰 → 产生泡泡 + 降温
      if (nid === 65 && Math.random() < 0.05) {
        world.set(nx, ny, 73); // 泡泡
        world.addTemp(x, y, -30);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
      }
    }

    if (y >= world.height - 1) return;

    // 下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      world.wakeArea(x, y);
      world.wakeArea(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity < DistilledWater.density && belowDensity < Infinity && belowDensity > 0) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      world.wakeArea(x, y);
      world.wakeArea(x, y + 1);
      return;
    }

    // 斜下流动
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(nx, y + 1);
        return;
      }
    }

    // 水平流动
    if (Math.random() < 0.4) {
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y);
          world.markUpdated(nx, y);
          world.wakeArea(x, y);
          world.wakeArea(nx, y);
          return;
        }
      }
    }
  },
};

registerMaterial(DistilledWater);
