import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 火花 —— 烟花爆炸产生的彩色短寿命粒子
 * - 向四周扩散，受重力影响缓慢下落
 * - 短寿命后消失（变为烟或空气）
 */

/** 火花生命值 */
const sparkLife = new Map<string, number>();
/** 火花颜色缓存（每个火花保持固定颜色） */
const sparkColor = new Map<string, number>();

/** 预定义的烟花颜色（ABGR 格式） */
const SPARK_COLORS = [
  (0xFF << 24) | (50 << 16) | (50 << 8) | 255,   // 红
  (0xFF << 24) | (50 << 16) | (255 << 8) | 255,   // 黄
  (0xFF << 24) | (255 << 16) | (200 << 8) | 50,   // 蓝
  (0xFF << 24) | (50 << 16) | (255 << 8) | 50,    // 绿
  (0xFF << 24) | (255 << 16) | (100 << 8) | 255,  // 紫
  (0xFF << 24) | (200 << 16) | (255 << 8) | 255,  // 白
];

function getKey(x: number, y: number): string {
  return `${x},${y}`;
}

export const Spark: MaterialDef = {
  id: 28,
  name: '火花',
  color() {
    // 默认颜色，实际由缓存决定
    return SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
  },
  density: 0.2,
  update(x: number, y: number, world: WorldAPI) {
    const key = getKey(x, y);

    // 初始化生命值
    let life = sparkLife.get(key);
    if (life === undefined) {
      life = 15 + Math.floor(Math.random() * 25); // 15~40 帧
      sparkLife.set(key, life);
    }

    life--;
    sparkLife.set(key, life);

    // 刷新颜色（闪烁）
    world.set(x, y, 28);
    // 恢复缓存颜色
    const cachedColor = sparkColor.get(key);
    if (cachedColor !== undefined) {
      // 通过重新 set 来刷新，颜色由 color() 随机
      // 但我们需要保持一致的颜色 — 这里直接操作不了 colors
      // 所以火花的闪烁就靠 color() 的随机性
    }

    // 生命耗尽
    if (life <= 0) {
      sparkLife.delete(key);
      sparkColor.delete(key);
      if (Math.random() < 0.2) {
        world.set(x, y, 7); // 烟
      } else {
        world.set(x, y, 0); // 空气
      }
      return;
    }

    // 受重力缓慢下落
    if (y < world.height - 1 && Math.random() < 0.4) {
      if (world.isEmpty(x, y + 1)) {
        // 迁移生命值
        const newKey = getKey(x, y + 1);
        sparkLife.set(newKey, life);
        sparkLife.delete(key);
        const c = sparkColor.get(key);
        if (c !== undefined) {
          sparkColor.set(newKey, c);
          sparkColor.delete(key);
        }
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
        const newKey = getKey(nx, y);
        sparkLife.set(newKey, life);
        sparkLife.delete(key);
        const c = sparkColor.get(key);
        if (c !== undefined) {
          sparkColor.set(newKey, c);
          sparkColor.delete(key);
        }
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Spark);
