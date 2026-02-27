import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 橡胶 —— 弹性固体
 * 不可移动，但会让落在上面的粒子反弹（向上弹射）
 * 可燃（高温下熔化为烟）
 */

/** 不参与弹射的材质（空气、固体、气体等） */
const SKIP = new Set([0, 3, 6, 7, 8, 10, 14, 17, 18, 19, 21, 25, 28, 29, 30, 31, 32, 33]);

export const Rubber: MaterialDef = {
  id: 33,
  name: '橡胶',
  color() {
    // 深灰偏紫的橡胶色，带微小随机变化
    const base = 60 + Math.floor(Math.random() * 10);
    const r = base;
    const g = base - 15;
    const b = base + 10;
    return (0xFF << 24) | (Math.max(0, b) << 16) | (Math.max(0, g) << 8) | r;
  },
  density: Infinity, // 固体，不可移动
  update(x: number, y: number, world: WorldAPI) {
    // 高温下橡胶燃烧 → 烟 + 火
    const temp = world.getTemp(x, y);
    if (temp > 150 && Math.random() < 0.02) {
      world.set(x, y, 7); // 变成烟
      // 周围可能点火
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 6); // 火
      }
      return;
    }

    // 核心机制：检测上方是否有粒子正在下落（即上方有非固体、非气体粒子）
    // 如果有，将其弹射到更高位置
    if (y <= 0) return;

    const aboveId = world.get(x, y - 1);
    // 跳过空气(0)、固体(不动的)、火(6)、烟(7)、蒸汽(8)、毒气(18)、氢气(19)、火花(28)
    if (SKIP.has(aboveId)) return;

    // 找到上方可弹射的目标位置（向上 2~4 格）
    const bounceHeight = 2 + Math.floor(Math.random() * 3);
    let targetY = y - 1;
    for (let dy = 2; dy <= bounceHeight + 1; dy++) {
      const ny = y - dy;
      if (!world.inBounds(x, ny)) break;
      if (!world.isEmpty(x, ny)) break;
      targetY = ny;
    }

    // 如果找到了更高的空位，执行弹射
    if (targetY < y - 1) {
      world.swap(x, y - 1, x, targetY);
      world.markUpdated(x, targetY);
      world.wakeArea(x, targetY);
    }
  },
};

registerMaterial(Rubber);
