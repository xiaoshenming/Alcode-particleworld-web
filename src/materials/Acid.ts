import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 酸液 —— 腐蚀性液体，可溶解大部分固体和液体
 * 溶解后自身也会消耗（质量守恒）
 * 新增：
 * - 酸 + 金属 → 慢速腐蚀，产生火花+烟（化学发热反应）
 * - 酸 + 石头/玻璃 → 产生气泡（CO₂效果，用泡沫模拟）
 * - 酸 + 金 → 免疫（金对酸耐腐蚀）
 */

/** 完全免疫酸腐蚀的材质 */
const ACID_IMMUNE = new Set([0, 9, 31]); // 空气、酸液自身、金（抗酸）

/** 酸腐蚀金属：产生气泡和火花（模拟氢气释放） */
function corrodeMetal(x: number, y: number, nx: number, ny: number, world: WorldAPI): boolean {
  // 金属被酸腐蚀概率极低（0.3%），但会产生剧烈视觉效果
  if (Math.random() > 0.003) return false;
  world.set(nx, ny, 0); // 金属被溶解
  // 产生泡沫（模拟氢气气泡）
  if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) {
    world.set(x, y - 1, 51); // 泡沫/气泡
  }
  // 产生火花（腐蚀热量）
  if (Math.random() < 0.3 && world.inBounds(x, y - 2) && world.isEmpty(x, y - 2)) {
    world.set(x, y - 2, 28); // 火花
  }
  // 酸液也被消耗
  world.set(x, y, 7); // 变烟（腐蚀气体）
  return true;
}

/** 酸腐蚀石头/玻璃：产生气泡（CO₂）*/
function corrodeRock(x: number, y: number, nx: number, ny: number, world: WorldAPI): boolean {
  if (Math.random() > 0.008) return false;
  world.set(nx, ny, 0);
  // 气泡向上飘
  if (world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) {
    world.set(nx, ny - 1, 73); // 泡泡
  }
  if (Math.random() < 0.4) {
    world.set(x, y, 7); // 酸液消��变烟
    return true;
  }
  return false;
}

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
      if (ACID_IMMUNE.has(neighborId)) continue;

      // 金属：特殊腐蚀（慢但有特效）
      if (neighborId === 10) {
        if (corrodeMetal(x, y, nx, ny, world)) return;
        continue;
      }

      // 石头(3)、玻璃(17)、黑曜石(60)：产生气泡
      if (neighborId === 3 || neighborId === 17 || neighborId === 60) {
        if (corrodeRock(x, y, nx, ny, world)) return;
        continue;
      }

      if (neighborId === 0) continue;

      // 普通腐蚀：固体 3%，液体/气体 5%
      const density = world.getDensity(nx, ny);
      const chance = density >= Infinity ? 0.03 : 0.05;

      if (Math.random() < chance) {
        world.set(nx, ny, 0);
        if (Math.random() < 0.5) {
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
