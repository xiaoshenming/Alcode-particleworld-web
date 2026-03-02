import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 冰晶 —— 透明蓝白色固体，带闪烁效果
 * - 不可移动
 * - 高温(>50°)融化为水(2)
 * - 冷冻周围环境（持续降温）
 * - 视觉闪烁：通过 wakeArea 保持活跃刷新颜色
 */
export const IceCrystal: MaterialDef = {
  id: 163,
  name: '冰晶',
  color() {
    // 透明蓝白色带闪烁效果
    const sparkle = Math.random();
    if (sparkle < 0.15) {
      // 偶尔闪烁白光
      const v = 230 + Math.floor(Math.random() * 25);
      return (0xFF << 24) | (v << 16) | (v << 8) | v;
    }
    const r = 180 + Math.floor(Math.random() * 40);
    const g = 210 + Math.floor(Math.random() * 30);
    const b = 240 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化为水
    if (temp > 50) {
      world.set(x, y, 2); // 水
      world.setTemp(x, y, 10);
      return;
    }

    // 冰晶自身保持极低温
    world.setTemp(x, y, Math.min(temp, -20));

    // 冷冻周围环境（显式4方向，无HOF）
    // 遇热源（火/熔岩/蒸汽）加速融化：立即return
    if (world.inBounds(x, y - 1)) {
      const nid0 = world.get(x, y - 1);
      if (nid0 === 6 || nid0 === 11 || nid0 === 8) {
        if (Math.random() < 0.15) { world.set(x, y, 2); world.setTemp(x, y, 5); return; }
      }
    }
    if (world.inBounds(x, y + 1)) {
      const nid1 = world.get(x, y + 1);
      if (nid1 === 6 || nid1 === 11 || nid1 === 8) {
        if (Math.random() < 0.15) { world.set(x, y, 2); world.setTemp(x, y, 5); return; }
      }
    }
    if (world.inBounds(x - 1, y)) {
      const nid2 = world.get(x - 1, y);
      if (nid2 === 6 || nid2 === 11 || nid2 === 8) {
        if (Math.random() < 0.15) { world.set(x, y, 2); world.setTemp(x, y, 5); return; }
      }
    }
    if (world.inBounds(x + 1, y)) {
      const nid3 = world.get(x + 1, y);
      if (nid3 === 6 || nid3 === 11 || nid3 === 8) {
        if (Math.random() < 0.15) { world.set(x, y, 2); world.setTemp(x, y, 5); return; }
      }
    }
    // 冷冻邻居：降温 + 冻结水（不return）
    if (world.inBounds(x, y - 1)) {
      world.addTemp(x, y - 1, -2);
      if (world.get(x, y - 1) === 2 && Math.random() < 0.01) { world.set(x, y - 1, 14); world.markUpdated(x, y - 1); }
    }
    if (world.inBounds(x, y + 1)) {
      world.addTemp(x, y + 1, -2);
      if (world.get(x, y + 1) === 2 && Math.random() < 0.01) { world.set(x, y + 1, 14); world.markUpdated(x, y + 1); }
    }
    if (world.inBounds(x - 1, y)) {
      world.addTemp(x - 1, y, -2);
      if (world.get(x - 1, y) === 2 && Math.random() < 0.01) { world.set(x - 1, y, 14); world.markUpdated(x - 1, y); }
    }
    if (world.inBounds(x + 1, y)) {
      world.addTemp(x + 1, y, -2);
      if (world.get(x + 1, y) === 2 && Math.random() < 0.01) { world.set(x + 1, y, 14); world.markUpdated(x + 1, y); }
    }

    // 保持活跃以刷新闪烁视觉效果
    world.wakeArea(x, y);
    // 刷新颜色（触发闪烁）
    world.set(x, y, 163);
  },
};

registerMaterial(IceCrystal);
