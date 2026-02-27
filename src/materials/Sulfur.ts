import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 硫磺 —— 黄色易燃粉末
 * - 粉末状固体，受重力下落（类似沙子）
 * - 可燃：遇火/熔岩/等离子体燃烧，产生毒气和火焰
 * - 燃烧时释放大量毒气（蓝紫色火焰效果通过产生火实现）
 * - 遇熔岩直接融化为液态（变为油的行为模拟液态硫）
 * - 低温稳定，高温（>100°）自燃
 * - 酸液可溶解
 */

/** 可点燃硫磺的材质 */
const IGNITER = new Set([6, 11, 55, 28]); // 火、熔岩、等离子体、火花

export const Sulfur: MaterialDef = {
  id: 66,
  name: '硫磺',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 亮黄色
      r = 220 + Math.floor(Math.random() * 30);
      g = 200 + Math.floor(Math.random() * 30);
      b = 20 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗黄色
      r = 190 + Math.floor(Math.random() * 25);
      g = 170 + Math.floor(Math.random() * 25);
      b = 10 + Math.floor(Math.random() * 15);
    } else {
      // 黄绿色调
      r = 200 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 30 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃
    if (temp > 100 && Math.random() < 0.1) {
      world.set(x, y, 6); // 火
      // 上方产生毒气
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 18); // 毒气
        world.markUpdated(x, y - 1);
      }
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火源燃烧
      if (IGNITER.has(nid) && Math.random() < 0.4) {
        world.set(x, y, 6); // 火
        // 产生毒气
        if (y > 0 && world.isEmpty(x, y - 1)) {
          world.set(x, y - 1, 18); // 毒气
          world.markUpdated(x, y - 1);
        }
        world.wakeArea(x, y);
        return;
      }

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.15) {
        world.set(x, y, 0);
        world.set(nx, ny, 0); // 酸液也消耗
        world.wakeArea(x, y);
        return;
      }
    }

    // 重力下落
    if (y < world.height - 1) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < 2.0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y);
        world.markUpdated(x, y + 1);
        return;
      }
      // 滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Sulfur);
