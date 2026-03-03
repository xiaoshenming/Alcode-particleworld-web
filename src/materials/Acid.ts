import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 酸液 —— 腐蚀性液体，可溶解大部分固体和液体
 * 溶解后自身也会消耗（质量守恒）
 * 新增：
 * - 酸 + 金属(10) → 铁锈(72)（腐蚀产物），产生火花+泡沫（氢气释放）
 * - 酸 + 石头/玻璃 → 产生气泡（CO₂效果，用泡沫模拟）
 * - 酸 + 金(31)/铁锈(72)/橡胶(33)/陶瓷(90) → 免疫（耐酸材质）
 */

/** 完全免疫酸腐蚀的材质 */
const ACID_IMMUNE = new Set([0, 9, 31, 72, 33, 90]); // 空气、酸液自身、金、铁锈（终产物）、橡胶、陶瓷

/** 酸腐蚀金属：产生铁锈+气泡+火花（模拟氢气释放和腐蚀） */
function corrodeMetal(x: number, y: number, nx: number, ny: number, world: WorldAPI): boolean {
  // 金属被酸腐蚀概率极低（0.3%），产生剧烈视觉效果
  if (Math.random() > 0.003) return false;
  world.set(nx, ny, 72); // 金属被腐蚀→铁锈（物理正确：酸+铁→铁锈）
  // 产生泡沫（模拟氢气气泡，酸+铁→FeSO₄+H₂↑）
  if (world.inBounds(x, y - 1) && world.isEmpty(x, y - 1)) {
    world.set(x, y - 1, 51); // 泡沫/气泡
  }
  // 产生火花（腐蚀反应放热）
  if (Math.random() < 0.3 && world.inBounds(x, y - 2) && world.isEmpty(x, y - 2)) {
    world.set(x, y - 2, 28); // 火花
  }
  // 酸液被消耗（50%概率变烟，代表腐蚀气体挥发）
  if (Math.random() < 0.5) {
    world.set(x, y, 7); // 变烟
    return true;
  }
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
    // 先尝试腐蚀周围材质（显式4方向，无HOF）
    {
      const nx = x, ny = y - 1;
      if (world.inBounds(nx, ny)) {
        const neighborId = world.get(nx, ny);
        if (!ACID_IMMUNE.has(neighborId) && neighborId !== 0) {
          if (neighborId === 10) { if (corrodeMetal(x, y, nx, ny, world)) return; }
          else if (neighborId === 3 || neighborId === 17 || neighborId === 60) { if (corrodeRock(x, y, nx, ny, world)) return; }
          else { const density = world.getDensity(nx, ny); const chance = density >= Infinity ? 0.03 : 0.05; if (Math.random() < chance) { world.set(nx, ny, 0); if (Math.random() < 0.5) { world.set(x, y, 7); return; } } }
        }
      }
    }
    {
      const nx = x, ny = y + 1;
      if (world.inBounds(nx, ny)) {
        const neighborId = world.get(nx, ny);
        if (!ACID_IMMUNE.has(neighborId) && neighborId !== 0) {
          if (neighborId === 10) { if (corrodeMetal(x, y, nx, ny, world)) return; }
          else if (neighborId === 3 || neighborId === 17 || neighborId === 60) { if (corrodeRock(x, y, nx, ny, world)) return; }
          else { const density = world.getDensity(nx, ny); const chance = density >= Infinity ? 0.03 : 0.05; if (Math.random() < chance) { world.set(nx, ny, 0); if (Math.random() < 0.5) { world.set(x, y, 7); return; } } }
        }
      }
    }
    {
      const nx = x - 1, ny = y;
      if (world.inBounds(nx, ny)) {
        const neighborId = world.get(nx, ny);
        if (!ACID_IMMUNE.has(neighborId) && neighborId !== 0) {
          if (neighborId === 10) { if (corrodeMetal(x, y, nx, ny, world)) return; }
          else if (neighborId === 3 || neighborId === 17 || neighborId === 60) { if (corrodeRock(x, y, nx, ny, world)) return; }
          else { const density = world.getDensity(nx, ny); const chance = density >= Infinity ? 0.03 : 0.05; if (Math.random() < chance) { world.set(nx, ny, 0); if (Math.random() < 0.5) { world.set(x, y, 7); return; } } }
        }
      }
    }
    {
      const nx = x + 1, ny = y;
      if (world.inBounds(nx, ny)) {
        const neighborId = world.get(nx, ny);
        if (!ACID_IMMUNE.has(neighborId) && neighborId !== 0) {
          if (neighborId === 10) { if (corrodeMetal(x, y, nx, ny, world)) return; }
          else if (neighborId === 3 || neighborId === 17 || neighborId === 60) { if (corrodeRock(x, y, nx, ny, world)) return; }
          else { const density = world.getDensity(nx, ny); const chance = density >= Infinity ? 0.03 : 0.05; if (Math.random() < chance) { world.set(nx, ny, 0); if (Math.random() < 0.5) { world.set(x, y, 7); return; } } }
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
