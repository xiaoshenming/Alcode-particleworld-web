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

    // 冷冻周围环境
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇热源（火/熔岩/蒸汽）加速融化
      if (nid === 6 || nid === 11 || nid === 8) {
        if (Math.random() < 0.15) {
          world.set(x, y, 2); // 融化为水
          world.setTemp(x, y, 5);
          return;
        }
      }

      // 冷冻邻居：降温
      world.addTemp(nx, ny, -2);

      // 相邻水有概率冻结为冰(14)
      if (nid === 2 && Math.random() < 0.01) {
        world.set(nx, ny, 14); // 冰
        world.markUpdated(nx, ny);
      }
    }

    // 保持活跃以刷新闪烁视觉效果
    world.wakeArea(x, y);
    // 刷新颜色（触发闪烁）
    world.set(x, y, 163);
  },
};

registerMaterial(IceCrystal);
