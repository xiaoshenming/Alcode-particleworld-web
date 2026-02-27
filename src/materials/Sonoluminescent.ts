import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声致发光材料 —— 检测周围粒子运动并发光的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 每帧检测周围 3x3 范围内活跃粒子数量
 * - 活跃粒子越多，颜色越亮（暗蓝 → 亮白蓝）
 * - 安静时暗淡，嘈杂时明亮闪烁
 * - 高温(>1200°) → 熔化为熔岩(11)
 */

/** 固体材质（不算作"活跃"运动粒子） */
const STATIC_SOLIDS = new Set([
  3, 10, 17, 33, 34, 36, 37, 38, 42, 53, 60, 61, 69, 77, 90,
  98, 106, 110, 115, 116, 118, 120, 126, 127, 132, 136, 149,
  151, 152, 168, 174, 190, 195, 214, 219, 229, 234, 239, 244,
  249, 254, 259, 264, 269, 274, 279, 284, 289, 294, 299, 304,
  309, 314, 319, 324, 329, 334, 339, 344, 349, 354, 359, 364, 369,
]);

export const Sonoluminescent: MaterialDef = {
  id: 370,
  name: '声致发光材料',
  category: '特殊',
  description: '检测周围粒子运动并发光的智能材料',
  density: Infinity,
  color() {
    // 随机亮度的蓝白色（每次 set 刷新时重新调用）
    if (Math.random() < 0.3) {
      // 亮白蓝（活跃态）
      const bright = 180 + Math.floor(Math.random() * 75);
      const r = bright - 30 + Math.floor(Math.random() * 20);
      const g = bright - 10 + Math.floor(Math.random() * 15);
      const b = bright;
      return (0xFF << 24) | (b << 16) | (g << 8) | r;
    }
    // 暗蓝（安静态）
    const base = 35 + Math.floor(Math.random() * 25);
    const r = base - 10;
    const g = base;
    const b = base + 30 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过热熔化
    if (temp > 1200) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 统计周围 3x3 范围内的活跃粒子数
    let activeCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);
        // 非空且非固体 = 活跃粒子
        if (nid !== 0 && !STATIC_SOLIDS.has(nid)) {
          activeCount++;
        }
      }
    }

    // 有活跃粒子时发光（重新 set 自身刷新颜色）
    if (activeCount > 0) {
      world.set(x, y, 370);
      world.wakeArea(x, y);
    }

    // 耐酸中等
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Sonoluminescent);
