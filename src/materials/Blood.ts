import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 血液 —— 有机液体
 * - 液体，受重力影响，流动性中等（比水粘稠）
 * - 遇火/高温凝固变为固体（血块→用石头表示）
 * - 低温冻结（<-5°）变为冰
 * - 遇酸液被分解
 * - 接触植物/种子促进生长
 * - 病毒在血液中传播更快
 * - 视觉上呈深红色
 */

export const Blood: MaterialDef = {
  id: 87,
  name: '血液',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深红色
      r = 140 + Math.floor(Math.random() * 30);
      g = 15 + Math.floor(Math.random() * 15);
      b = 15 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗红色
      r = 110 + Math.floor(Math.random() * 25);
      g = 8 + Math.floor(Math.random() * 12);
      b = 10 + Math.floor(Math.random() * 10);
    } else {
      // 亮红高光
      r = 175 + Math.floor(Math.random() * 30);
      g = 20 + Math.floor(Math.random() * 15);
      b = 20 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.2, // 比水略重
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温凝固（血块）
    if (temp > 80 && Math.random() < 0.05) {
      world.set(x, y, 3); // 石头（代表凝固血块）
      world.wakeArea(x, y);
      return;
    }

    // 低温冻结
    if (temp < -5 && Math.random() < 0.03) {
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

      // 遇火蒸发
      if (nid === 6 && Math.random() < 0.15) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 酸液分解
      if (nid === 9 && Math.random() < 0.06) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 促进种子发芽
      if (nid === 12 && Math.random() < 0.05) {
        world.set(nx, ny, 13); // 植物
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 病毒在血液中快速传播
      if (nid === 43 && Math.random() < 0.1) {
        world.set(x, y, 43); // 被感染
        world.wakeArea(x, y);
        return;
      }
    }

    // 重力下落
    if (y + 1 < world.height) {
      const below = world.get(x, y + 1);
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }
      // 密度置换（比轻液体沉底）
      if (below !== 0 && world.getDensity(x, y + 1) < 2.2 && world.getDensity(x, y + 1) > 0 && Math.random() < 0.3) {
        world.swap(x, y, x, y + 1);
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
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }

    // 水平扩散（比水慢）
    if (Math.random() < 0.15) {
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

registerMaterial(Blood);
