import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 水泥粉 —— 粉末状，像沙子一样下落
 * 遇水变成湿水泥（缓慢流动的液体），湿水泥一段时间后固化成混凝土
 * WetCement 使用 World 内置 age 替代 Map<string,number>（swap自动迁移计时器）
 * age=0: 未初始化; age=N: 固化剩余N帧
 */

/** 水泥粉（ID=34）—— 粉末，遇水变湿水泥 */
export const Cement: MaterialDef = {
  id: 34,
  name: '水泥',
  color() {
    const v = 140 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (v << 16) | (v << 8) | v; // 灰色
  },
  density: 4,
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居是否有水
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      // 水(2) 或 盐水(24) → 变成湿水泥
      if (nid === 2 || nid === 24) {
        world.set(x, y, 35); // 当前变湿水泥（age被重置为0，下帧WetCement会初始化）
        world.set(nx, ny, 35); // 水也变湿水泥
        world.markUpdated(x, y);
        world.markUpdated(nx, ny);
        return;
      }
    }

    // 粉末下落（类似沙子，swap自动迁移age）
    if (y < world.height - 1) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 斜向滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
      if (world.inBounds(x - dir, y + 1) && world.isEmpty(x - dir, y + 1)) {
        world.swap(x, y, x - dir, y + 1);
        world.markUpdated(x - dir, y + 1);
        return;
      }
    }
  },
};

/** 湿水泥（ID=35）—— 缓慢流动，一段时间后固化成混凝土
 * age=0: 未初始化; age=N: 固化剩余N帧
 */
export const WetCement: MaterialDef = {
  id: 35,
  name: '湿水泥',
  color() {
    const v = 100 + Math.floor(Math.random() * 10);
    const r = v;
    const g = v + 5;
    const b = v + 10;
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 深灰偏蓝
  },
  density: 6,
  update(x: number, y: number, world: WorldAPI) {
    // 固化计时（age=0表示未初始化）
    let timer = world.getAge(x, y);
    if (timer === 0) {
      timer = 120 + Math.floor(Math.random() * 60); // 120~180 帧后固化
      world.setAge(x, y, timer);
    }
    timer--;
    world.setAge(x, y, timer);

    // 固化完成 → 变成混凝土
    if (timer <= 0) {
      world.set(x, y, 36); // 混凝土
      world.markUpdated(x, y);
      return;
    }

    // 缓慢流动（比水慢很多，只有 30% 概率移动）
    if (Math.random() > 0.3) return;

    if (y < world.height - 1) {
      // 下落（swap 自动迁移 age）
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 侧向流动
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        if (world.inBounds(x + d, y + 1) && world.isEmpty(x + d, y + 1)) {
          world.swap(x, y, x + d, y + 1);
          world.markUpdated(x + d, y + 1);
          return;
        }
      }
      // 水平流动
      for (const d of [dir, -dir]) {
        if (world.inBounds(x + d, y) && world.isEmpty(x + d, y)) {
          world.swap(x, y, x + d, y);
          world.markUpdated(x + d, y);
          return;
        }
      }
    }
  },
};

/** 混凝土（ID=36）—— 坚硬固体，不可移动，耐高温 */
export const Concrete: MaterialDef = {
  id: 36,
  name: '混凝土',
  color() {
    const v = 160 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (v << 16) | ((v - 5) << 8) | (v - 10); // 浅灰偏暖
  },
  density: Infinity,
  update(_x: number, _y: number, _world: WorldAPI) {
    // 混凝土是惰性固体，不做任何事
  },
};

registerMaterial(Cement);
registerMaterial(WetCement);
registerMaterial(Concrete);
