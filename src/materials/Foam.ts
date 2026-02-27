import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 泡沫 —— 轻质浮力材质
 * - 密度极低，浮在水面上
 * - 接触水/盐水时缓慢生成更多泡沫（搅拌起泡）
 * - 有限寿命，逐渐破裂消失
 * - 火焰/高温会立即蒸发
 * - 酸液会溶解泡沫
 * 使用 World 内置 age 替代 Map<string,number>
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 水系材质（可以起泡） */
const WATER_LIKE = new Set([2, 24]); // 水、盐水

export const Foam: MaterialDef = {
  id: 51,
  name: '泡沫',
  color() {
    // 白色半透明感，带微蓝
    const base = 230 + Math.floor(Math.random() * 25);
    const r = base;
    const g = base;
    const b = base + Math.floor(Math.random() * 5);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.2, // 极轻，浮在水面
  update(x: number, y: number, world: WorldAPI) {
    // 初始化寿命（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 80 + Math.floor(Math.random() * 120); // 80~200 帧
      world.setAge(x, y, life);
    }

    // 高温蒸发
    if (world.getTemp(x, y) > 60) {
      world.set(x, y, 8); // 蒸汽
      return;
    }

    // 寿命递减
    life--;
    world.setAge(x, y, life);

    // 寿命耗尽：破裂消失
    if (life <= 0) {
      world.set(x, y, 0); // 空气
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    let touchWater = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触酸液溶解
      if (nid === 9) {
        world.set(x, y, 0);
        return;
      }

      // 接触火焰蒸发
      if (nid === 6) {
        world.set(x, y, 8); // 蒸汽
        return;
      }

      if (WATER_LIKE.has(nid)) {
        touchWater = true;
      }
    }

    // 接触水时有小概率在空气邻居处生成新泡沫
    if (touchWater && Math.random() < 0.02) {
      const start = Math.floor(Math.random() * dirs.length);
      for (let i = 0; i < dirs.length; i++) {
        const [dx, dy] = dirs[(start + i) % dirs.length];
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.isEmpty(nx, ny)) {
          world.set(nx, ny, 51);
          world.markUpdated(nx, ny);
          break;
        }
      }
    }

    // 浮力：向上移动（swap 自动迁移 age）
    if (y > 0) {
      const aboveId = world.get(x, y - 1);
      // 在水中上浮
      if (WATER_LIKE.has(aboveId)) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
    }

    // 重力：在空气中缓慢下落
    if (y < world.height - 1 && world.isEmpty(x, y + 1)) {
      if (Math.random() < 0.3) { // 缓慢下落
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 水平漂移
    if (Math.random() < 0.1) {
      const d = Math.random() < 0.5 ? -1 : 1;
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Foam);
