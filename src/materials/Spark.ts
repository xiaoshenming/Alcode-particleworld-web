import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 火花 —— 烟花爆炸产生的彩色短寿命粒子
 * 使用 World 内置 age 系统替代 Map<string,number>，swap 时 age 自动迁移
 */

const SPARK_COLORS = [
  (0xFF << 24) | (50 << 16) | (50 << 8) | 255,   // 红
  (0xFF << 24) | (50 << 16) | (255 << 8) | 255,   // 黄
  (0xFF << 24) | (255 << 16) | (200 << 8) | 50,   // 蓝
  (0xFF << 24) | (50 << 16) | (255 << 8) | 50,    // 绿
  (0xFF << 24) | (255 << 16) | (100 << 8) | 255,  // 紫
  (0xFF << 24) | (200 << 16) | (255 << 8) | 255,  // 白
];

export const Spark: MaterialDef = {
  id: 28,
  name: '火花',
  color() {
    return SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
  },
  density: 0.2,
  update(x: number, y: number, world: WorldAPI) {
    const age = world.getAge(x, y);

    // 生命耗尽：age>15 后以概率消失，模拟 15~40 帧随机寿命
    if (age > 15 && Math.random() < 0.04) {
      if (Math.random() < 0.2) {
        world.set(x, y, 7); // 烟
      } else {
        world.set(x, y, 0);
      }
      return;
    }

    // 受重力缓慢下落
    if (y < world.height - 1 && Math.random() < 0.4) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 随机水平漂移
    if (Math.random() < 0.3) {
      const dx = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dx;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Spark);
