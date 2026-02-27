import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 沼泽 —— 粘稠的泥水混合液体
 * - 密度介于水和蜂蜜之间，流动缓慢
 * - 陷入其中的粒子会被减速（粘滞效果）
 * - 接触种子时有概率生成植物
 * - 高温蒸发为泥土+蒸汽
 * - 可以缓慢吞噬沙子（沙子沉入变成沼泽）
 */

/** 会被沼泽减速/吞噬的轻质材质 */
const SINKABLE = new Set([1, 20]); // 沙子、泥土

export const Swamp: MaterialDef = {
  id: 54,
  name: '沼泽',
  color() {
    // 暗绿褐色
    const r = 50 + Math.floor(Math.random() * 30);
    const g = 70 + Math.floor(Math.random() * 35);
    const b = 20 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5, // 比水重，比蜂蜜轻
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温蒸发：变成泥土
    if (temp > 120) {
      world.set(x, y, 20); // 泥土
      // 上方释放蒸汽
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 8); // 蒸汽
        world.markUpdated(x, y - 1);
      }
      return;
    }

    // 低温冻结为泥土
    if (temp < -10) {
      world.set(x, y, 20);
      return;
    }

    // 检查四邻交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触种子：小概率催生植物
      if (nid === 12 && Math.random() < 0.03) {
        world.set(nx, ny, 13); // 植物
        world.markUpdated(nx, ny);
      }
    }

    // 吞噬上方沉入的沙子/泥土
    if (y > 0) {
      const aboveId = world.get(x, y - 1);
      if (SINKABLE.has(aboveId) && Math.random() < 0.05) {
        world.set(x, y - 1, 54); // 变成沼泽
        world.markUpdated(x, y - 1);
      }
    }

    // 粘稠流动（类似蜂蜜但更慢）
    const moveChance = 0.2 + Math.max(0, (temp - 20) * 0.003);
    if (Math.random() > moveChance) {
      world.wakeArea(x, y);
      return;
    }

    if (y >= world.height - 1) return;

    // 下落
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

    // 水平流动（极慢）
    if (Math.random() < 0.3) {
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y);
          world.markUpdated(nx, y);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y);
          world.markUpdated(nx, y);
          return;
        }
      }
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < Swamp.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Swamp);
