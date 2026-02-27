import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 泥浆 —— 水与泥土的混合态
 * - 粘稠液体，流动比水慢很多
 * - 密度介于水和沙子之间
 * - 干燥（周围无水且温度>30°）时缓慢变为泥土
 * - 冷冻时变为泥土（冰冻固化）
 * - 植物/种子在泥浆中生长更快
 * - 棕褐色浑浊外观
 */

export const Mud: MaterialDef = {
  id: 63,
  name: '泥浆',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深棕色
      r = 100 + Math.floor(Math.random() * 25);
      g = 70 + Math.floor(Math.random() * 20);
      b = 40 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 浅棕色
      r = 130 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 20);
      b = 55 + Math.floor(Math.random() * 15);
    } else {
      // 带水光的深色
      r = 85 + Math.floor(Math.random() * 20);
      g = 60 + Math.floor(Math.random() * 15);
      b = 35 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷冻固化为泥土
    if (temp < -5) {
      world.set(x, y, 20); // 泥土
      return;
    }

    // 检查周围环境
    let hasWater = false;
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 2 || nid === 24) hasWater = true; // 水或盐水

      // 高温蒸发水分变为泥土
      if (nid === 6 || nid === 11) { // 火或熔岩
        if (Math.random() < 0.05) {
          world.set(x, y, 20); // 泥土
          return;
        }
      }
    }

    // 干燥环境缓慢变为泥土
    if (!hasWater && temp > 30 && Math.random() < 0.002) {
      world.set(x, y, 20);
      return;
    }

    // 粘稠流动（比水慢，每帧有概率不动）
    if (Math.random() < 0.3) return; // 30% 概率跳过移动，模拟粘稠

    // 重力下落
    if (y < world.height - 1) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 2.5 && belowDensity > 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y);
        world.markUpdated(x, y + 1);
        return;
      }
      // 缓慢横向扩散（比水慢）
      if (Math.random() < 0.4) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        for (const d of [dir, -dir]) {
          const nx = x + d;
          if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
            world.swap(x, y, nx, y + 1);
            world.markUpdated(nx, y + 1);
            return;
          }
        }
        // 平面扩散
        for (const d of [dir, -dir]) {
          const nx = x + d;
          if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
            world.swap(x, y, nx, y);
            world.markUpdated(nx, y);
            return;
          }
        }
      }
    }
  },
};

registerMaterial(Mud);
