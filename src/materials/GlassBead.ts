import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 熔融玻璃珠 —— 高温下的小型玻璃球
 * - 粉末/颗粒，密度 2.8（像沙子一样堆积）
 * - 高温(>800°)时发出橙红色光芒
 * - 冷却后(<500°)变为普通玻璃(17)
 * - 接触水快速冷却并碎裂为玻璃
 * - 可以堆积，有沙子般的流动性
 */

export const GlassBead: MaterialDef = {
  id: 210,
  name: '熔融玻璃珠',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 橙红色高温
      r = 230 + Math.floor(Math.random() * 25);
      g = 120 + Math.floor(Math.random() * 50);
      b = 30 + Math.floor(Math.random() * 30);
    } else if (phase < 0.8) {
      // 亮黄色
      r = 240 + Math.floor(Math.random() * 15);
      g = 180 + Math.floor(Math.random() * 40);
      b = 50 + Math.floor(Math.random() * 40);
    } else {
      // 暗红色
      r = 200 + Math.floor(Math.random() * 30);
      g = 80 + Math.floor(Math.random() * 40);
      b = 20 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 保持高温
    if (temp < 800) {
      world.setTemp(x, y, 800);
    }

    // 刷新颜色（闪烁效果）
    world.set(x, y, 210);
    world.wakeArea(x, y);

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水：快速冷却为玻璃
      if (nid === 2) {
        world.set(x, y, 17); // 变为玻璃
        world.set(nx, ny, 8); // 水变蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5 || nid === 13) && Math.random() < 0.08) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }
    }

    // 缓慢冷却：自然变为玻璃
    if (Math.random() < 0.003) {
      world.set(x, y, 17);
      world.wakeArea(x, y);
      return;
    }

    // === 粉末下落逻辑（类似沙子） ===
    if (y >= world.height - 1) return;

    // 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 2.8 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下滑落
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
  },
};

registerMaterial(GlassBead);
