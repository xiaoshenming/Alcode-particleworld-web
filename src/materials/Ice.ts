import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 热源材质 ID */
const HOT = new Set([6, 8, 11]); // 火、蒸汽、熔岩

/**
 * 冰 —— 固体，水冻结产物
 * - 遇火/熔岩/蒸汽 → 融化为水
 * - 相邻水有小概率冻结为冰（扩散冻结）
 */
export const Ice: MaterialDef = {
  id: 14,
  name: '冰',
  color() {
    const r = 160 + Math.floor(Math.random() * 30);
    const g = 210 + Math.floor(Math.random() * 20);
    const b = 240 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 浅蓝色
  },
  density: Infinity, // 固体不可移动
  update(x: number, y: number, world: WorldAPI) {
    // 温度高于 0° 时融化
    if (world.getTemp(x, y) > 35) {
      world.set(x, y, 2); // 变水
      world.setTemp(x, y, 20);
      return;
    }

    // 冰降低周围温度
    world.setTemp(x, y, Math.min(world.getTemp(x, y), -5));

    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];

    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇热源融化为水
      if (HOT.has(nid)) {
        world.set(x, y, 2); // 变水
        return;
      }

      // 扩散冻结：相邻水有小概率冻结
      if (nid === 2 && Math.random() < 0.005) {
        world.set(nx, ny, 14);
        world.markUpdated(nx, ny);
      }
    }
  },
};

registerMaterial(Ice);
