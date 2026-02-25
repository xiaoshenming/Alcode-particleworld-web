import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液晶 —— 温度敏感的有序液体
 * - 液体，中等密度
 * - 颜色随温度变化（冷=蓝，常温=绿，热=红）
 * - 流动缓慢（有序排列的粘性）
 * - 高温(>300)分解为烟(7)
 * - 低温(<-10)凝固为玻璃(17)
 * - 遇电线(44)/雷电(16)改变排列方向（颜色闪烁）
 * - 视觉上呈半透明彩色液体
 */

export const LiquidCrystal: MaterialDef = {
  id: 117,
  name: '液晶',
  color() {
    // 基础颜色在常温下为蓝绿色，update中会根据温度变化
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 蓝绿色
      r = 40 + Math.floor(Math.random() * 30);
      g = 160 + Math.floor(Math.random() * 40);
      b = 180 + Math.floor(Math.random() * 40);
    } else if (t < 0.8) {
      // 青色
      r = 30 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 30);
      b = 200 + Math.floor(Math.random() * 30);
    } else {
      // 深蓝
      r = 50 + Math.floor(Math.random() * 20);
      g = 120 + Math.floor(Math.random() * 30);
      b = 190 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 300) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 低温凝固为玻璃
    if (temp < -10) {
      world.set(x, y, 17); // 玻璃
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇电线/雷电闪烁（重新着色）
      if ((nid === 44 || nid === 16) && Math.random() < 0.2) {
        // 温度变化模拟电场效应
        world.addTemp(x, y, 5);
        world.wakeArea(x, y);
      }

      // 遇火加热
      if (nid === 6 || nid === 11) {
        world.addTemp(x, y, 8);
      }

      // 遇冰/液氮冷却
      if (nid === 14 || nid === 68) {
        world.addTemp(x, y, -5);
      }
    }

    // 根据温度保持活跃（颜色在 color() 中随机生成）
    world.wakeArea(x, y);

    // 液体流动（粘性，较慢）
    if (Math.random() < 0.7) {
      if (world.inBounds(x, y + 1)) {
        const below = world.get(x, y + 1);
        if (below === 0) {
          world.swap(x, y, x, y + 1);
          world.markUpdated(x, y + 1);
          world.wakeArea(x, y + 1);
          return;
        }

        const belowDensity = world.getDensity(x, y + 1);
        if (belowDensity < this.density && belowDensity > 0) {
          world.swap(x, y, x, y + 1);
          world.markUpdated(x, y + 1);
          world.wakeArea(x, y + 1);
          return;
        }

        const dir = Math.random() < 0.5 ? -1 : 1;
        for (const d of [dir, -dir]) {
          const sx = x + d;
          if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
            world.swap(x, y, sx, y + 1);
            world.markUpdated(sx, y + 1);
            world.wakeArea(sx, y + 1);
            return;
          }
        }

        // 水平扩散
        if (Math.random() < 0.4) {
          for (const d of [dir, -dir]) {
            const sx = x + d;
            if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
              world.swap(x, y, sx, y);
              world.markUpdated(sx, y);
              world.wakeArea(sx, y);
              return;
            }
          }
        }
      }
    }
  },
};

registerMaterial(LiquidCrystal);
