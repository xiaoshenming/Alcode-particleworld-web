import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 藤蔓 —— 攀爬生长的植物
 * - 从种子/植物旁生成，沿墙壁向上攀爬
 * - 需要邻近固体表面才能生长（攀附）
 * - 接触水加速生长，干燥环境生长缓慢
 * - 可燃，火烧后变成烟
 * - 酸液可溶解藤蔓
 * - 深绿色，比植物更暗
 */

/** 藤蔓可攀附的固体表面 */
const SOLID_SURFACE = new Set([3, 10, 17, 34, 36, 53]); // 石头、金属、玻璃、水泥、混凝土、水晶

/** 促进生长的水源 */
const WATER_SOURCE = new Set([2, 24, 54]); // 水、盐水、沼泽

export const Vine: MaterialDef = {
  id: 57,
  name: '藤蔓',
  color() {
    // 深绿色，带自然变化
    const r = 15 + Math.floor(Math.random() * 25);
    const g = 80 + Math.floor(Math.random() * 50);
    const b = 10 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固定不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温燃烧
    if (temp > 80) {
      world.set(x, y, 6); // 火
      return;
    }

    // 低温休眠，不生长
    if (temp < -5) return;

    // 检查邻居
    const dirs = DIRS4;
    let hasSupport = false;
    let hasWater = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 被酸液溶解
      if (nid === 9) {
        world.set(x, y, 0);
        return;
      }

      // 被火点燃
      if (nid === 6 && Math.random() < 0.15) {
        world.set(x, y, 6);
        return;
      }

      if (SOLID_SURFACE.has(nid) || nid === 57) hasSupport = true;
      if (WATER_SOURCE.has(nid)) hasWater = true;
    }

    // 没有支撑面则不生长
    if (!hasSupport) return;

    // 生长概率：有水时加速
    const growChance = hasWater ? 0.04 : 0.01;
    if (Math.random() > growChance) return;

    // 优先向上生长，其次水平，最后向下
    const growDirs: [number, number][] = [
      [0, -1],  // 上
      [-1, 0], [1, 0],  // 左右
      [0, 1],   // 下（垂挂）
    ];

    // 随机打乱同优先级方向
    if (Math.random() < 0.5) {
      [growDirs[1], growDirs[2]] = [growDirs[2], growDirs[1]];
    }

    for (const [dx, dy] of growDirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (!world.isEmpty(nx, ny)) continue;

      // 新位置也需要有支撑面（邻近固体或藤蔓）
      let newSupport = false;
      for (const [ddx, ddy] of dirs) {
        const nnx = nx + ddx, nny = ny + ddy;
        if (!world.inBounds(nnx, nny)) continue;
        const nnid = world.get(nnx, nny);
        if (SOLID_SURFACE.has(nnid)) {
          newSupport = true;
          break;
        }
      }

      if (newSupport) {
        world.set(nx, ny, 57);
        world.markUpdated(nx, ny);
        return;
      }
    }
  },
};

registerMaterial(Vine);
