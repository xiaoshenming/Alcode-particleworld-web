import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氰化钠 —— 剧毒白色粉末
 * - 粉末，密度 1.8（像盐一样堆积）
 * - 剧毒：接触水(2)释放毒气(18)
 * - 遇酸释放大量毒气（氰化氢）
 * - 高温(>560°)分解为烟
 * - 白色微黄粉末
 */

export const SodiumCyanide: MaterialDef = {
  id: 213,
  name: '氰化钠',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.7) {
      // 白色粉末
      r = 230 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 20);
      b = 215 + Math.floor(Math.random() * 20);
    } else {
      // 微黄色
      r = 235 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 560) {
      world.set(x, y, 18); // 变毒气
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水释放毒气
      if (nid === 2 && Math.random() < 0.05) {
        world.set(x, y, 18); // 变毒气
        world.markUpdated(x, y);
        world.wakeArea(x, y);
        return;
      }

      // 遇酸剧烈反应：释放大量毒气
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.15) {
        world.set(x, y, 18); // 变毒气
        world.set(nx, ny, 18); // 酸也变毒气
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }

    // === 粉末下落逻辑 ===
    if (y >= world.height - 1) return;

    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 1.8 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(SodiumCyanide);
