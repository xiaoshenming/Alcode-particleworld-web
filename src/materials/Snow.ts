import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 热源材质 ID */
const HOT = new Set([6, 8, 11]); // 火、蒸汽、熔岩

/**
 * 雪 —— 粉末类，受重力下落可堆积
 * - 遇火/熔岩/蒸汽 → 融化为水
 * - 相邻水有小概率冻结水为冰
 */
export const Snow: MaterialDef = {
  id: 15,
  name: '雪',
  color() {
    const v = 230 + Math.floor(Math.random() * 25);
    return (0xFF << 24) | (v << 16) | (v << 8) | v; // 白色微变
  },
  density: 1.5, // 比水轻，比空气重
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居：遇热融化
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (HOT.has(nid)) {
        world.set(x, y, 2); // 融化为水
        return;
      }

      // 雪接触水，有概率冻结水为冰
      if (nid === 2 && Math.random() < 0.008) {
        world.set(nx, ny, 14); // 水变冰
        world.markUpdated(nx, ny);
      }
    }

    if (y >= world.height - 1) return;

    // 重力下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下滑落（比沙子更容易堆积，只尝试一个方向）
    const dir = Math.random() < 0.5 ? -1 : 1;
    const nx = x + dir;
    if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
      world.swap(x, y, nx, y + 1);
      world.markUpdated(nx, y + 1);
    }
  },
};

registerMaterial(Snow);
