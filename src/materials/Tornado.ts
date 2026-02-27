import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 龙卷风 —— 旋转气流，吸引周围粒子向中心并向上抛射
 * 有限寿命，逐渐消散
 * 使用 World 内置 age 替代 Map<string,number>（swap自动迁移age）
 * age=0: 未初始化; age=N: 剩余寿命=N
 */

/** 不可被龙卷风移动的材质（固体/工具类） */
const IMMOVABLE = new Set([3, 10, 14, 17, 21, 25, 29, 31, 32, 33, 36, 37, 38, 39, 41, 42, 44, 47]);

export const Tornado: MaterialDef = {
  id: 50,
  name: '龙卷风',
  color() {
    const v = 180 + Math.floor(Math.random() * 50);
    const a = 0xFF;
    return (a << 24) | (v << 16) | (v << 8) | v;
  },
  density: 0.05,
  update(x: number, y: number, world: WorldAPI) {
    // 初始化/递减生命值（age=0表示未初始化）
    let life = world.getAge(x, y);
    if (life === 0) {
      life = 100 + Math.floor(Math.random() * 100); // 100~200 帧
    }
    life--;

    // 刷新颜色（旋转闪烁效果）：set()会重置age，需立即恢复
    world.set(x, y, 50);
    world.setAge(x, y, life);

    // 生命耗尽消散
    if (life <= 0) {
      world.set(x, y, 0);
      return;
    }

    // 吸引范围（随生命值缩小）
    const radius = Math.max(2, Math.floor(life / 20));

    // 扫描周围粒子，将其向中心移动或向上抛
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) continue;

        const targetId = world.get(nx, ny);
        if (targetId === 0 || targetId === 50) continue; // 跳过空气和其他龙卷风
        if (IMMOVABLE.has(targetId)) continue;

        // 概率与距离成反比
        if (Math.random() > 0.15 / dist) continue;

        // 计算向中心+向上的移动方向
        const moveX = dx > 0 ? -1 : dx < 0 ? 1 : 0;
        const moveY = -1; // 总是向上抛

        const destX = nx + moveX;
        const destY = ny + moveY;

        if (world.inBounds(destX, destY) && world.isEmpty(destX, destY)) {
          world.swap(nx, ny, destX, destY); // swap 自动迁移 age
          world.markUpdated(destX, destY);
        }
      }
    }

    // 龙卷风自身缓慢向上移动（swap 自动迁移 age）
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.3) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Tornado);
