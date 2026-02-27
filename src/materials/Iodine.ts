import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 碘气 —— 紫色有毒气体，碘的气态
 * - 气体，密度 -0.2（比空气重，缓慢上升）
 * - 遇冷(<50°) → 凝华为碘晶体（用紫色固体表示，变为石头(3)染色）
 * - 接触金属(10) → 腐蚀（概率0.01）
 * - 接触水(2) → 染色为棕色（变为毒液(19)）
 * - 有生命周期
 * - 紫色半透明
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

export const Iodine: MaterialDef = {
  id: 308,
  name: '碘气',
  category: '气体',
  description: '紫色有毒气体，碘的气态',
  density: -0.2,
  color() {
    const r = 100 + Math.floor(Math.random() * 30);
    const g = 30 + Math.floor(Math.random() * 20);
    const b = 140 + Math.floor(Math.random() * 40);
    return (0x99 << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 90 + Math.floor(Math.random() * 90);
      world.setAge(x, y, life);
    }

    life--;
    world.setAge(x, y, life);

    if (life <= 0) {
      world.set(x, y, 0);
      return;
    }

    const temp = world.getTemp(x, y);

    // 遇冷凝华
    if (temp < 50) {
      if (Math.random() < 0.02) {
        world.set(x, y, 3); // 凝华为固体
        world.wakeArea(x, y);
        return;
      }
    }

    // 邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 腐蚀金属
      if (nid === 10 && Math.random() < 0.01) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 污染水
      if (nid === 2 && Math.random() < 0.06) {
        world.set(nx, ny, 19);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 缓慢上升（swap 自动迁移 age）
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.35) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上方
    if (y > 0) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1) && Math.random() < 0.25) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 水平漂移
    if (Math.random() < 0.35) {
      const windDir = world.getWind();
      const windStr = world.getWindStrength();
      let dir: number;
      if (windDir !== 0 && Math.random() < windStr) {
        dir = windDir;
      } else {
        dir = Math.random() < 0.5 ? -1 : 1;
      }
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Iodine);
