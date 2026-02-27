import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 酸液 —— 腐蚀性液体，可溶解大部分固体和液体
 * 溶解后自身也会消耗（质量守恒）
 */

/** 不可被酸溶解的材质 */
const ACID_IMMUNE = new Set([0, 9, 10]); // 空气、酸液自身、金属

export const Acid: MaterialDef = {
  id: 9,
  name: '酸液',
  color() {
    const r = 50 + Math.floor(Math.random() * 30);
    const g = 220 + Math.floor(Math.random() * 35);
    const b = 20 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 亮绿色
  },
  density: 2.5, // 比水重一点
  update(x: number, y: number, world: WorldAPI) {
    // 先尝试腐蚀周围材质
    for (const [dx, dy] of DIRS4) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const neighborId = world.get(nx, ny);
      if (neighborId === 0 || ACID_IMMUNE.has(neighborId)) continue;

      // 腐蚀概率：固体 3%，液体/气体 5%
      const density = world.getDensity(nx, ny);
      const chance = density >= Infinity ? 0.03 : 0.05;

      if (Math.random() < chance) {
        // 溶解目标，酸液自身也有 50% 概率消耗
        world.set(nx, ny, 0);
        if (Math.random() < 0.5) {
          // 酸液消耗，产生烟雾
          world.set(x, y, 7); // 烟
          return;
        }
      }
    }

    if (y >= world.height - 1) return;

    // 液体物理：下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
        {
      const d = dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 水平流动
    const spread = 2 + Math.floor(Math.random() * 2);
        {
      const d = dir;
      for (let i = 1; i <= spread; i++) {
        const sx = x + d * i;
        if (!world.inBounds(sx, y)) break;
        if (world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
        if (!world.isEmpty(sx, y)) break;
      }
    }
    {
      const d = -dir;
      for (let i = 1; i <= spread; i++) {
        const sx = x + d * i;
        if (!world.inBounds(sx, y)) break;
        if (world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
        if (!world.isEmpty(sx, y)) break;
      }
    }

    // 密度置换：酸比水重，沉到水下面
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < Acid.density) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Acid);
