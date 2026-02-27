import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 珊瑚 —— 水中缓慢生长的生物结构
 * - 固体，密度无限，不可移动
 * - 只在水中生长：向相邻的水格扩展（缓慢）
 * - 离开水会停止生长
 * - 酸液可以腐蚀
 * - 高温（>200°）会白化死亡（变为石头）
 * - 多彩外观：粉红、橙、紫色
 */

export const Coral: MaterialDef = {
  id: 64,
  name: '珊瑚',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 粉红色
      r = 220 + Math.floor(Math.random() * 35);
      g = 80 + Math.floor(Math.random() * 40);
      b = 100 + Math.floor(Math.random() * 40);
    } else if (phase < 0.6) {
      // 橙珊瑚色
      r = 230 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 40);
      b = 50 + Math.floor(Math.random() * 30);
    } else if (phase < 0.85) {
      // 紫色
      r = 160 + Math.floor(Math.random() * 40);
      g = 60 + Math.floor(Math.random() * 30);
      b = 180 + Math.floor(Math.random() * 50);
    } else {
      // 浅黄绿（稀有色）
      r = 180 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 30);
      b = 100 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温白化死亡 → 变为石头
    if (temp > 200) {
      world.set(x, y, 3); // 石头
      return;
    }

    const dirs = [...DIRS4];
    let waterNeighbors = 0;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液腐蚀
      if (nid === 9) {
        world.set(x, y, 0);
        world.set(nx, ny, 0); // 酸液也消耗
        return;
      }

      // 统计水邻居
      if (nid === 2 || nid === 24) waterNeighbors++; // 水或盐水
    }

    // 只在水中生长
    if (waterNeighbors >= 2 && Math.random() < 0.003) {
      // 随机选一个水格扩展
      const shuffled = dirs.sort(() => Math.random() - 0.5);
      for (const [dx, dy] of shuffled) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        if (nid === 2 || nid === 24) {
          world.set(nx, ny, 64); // 新珊瑚
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
          return;
        }
      }
    }

    // 缓慢散热
    if (temp > 25) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Coral);
