import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氟化氢 —— 剧毒腐蚀性气体
 * - 气体，密度 0.3（比空气略重，缓慢上升）
 * - 极强腐蚀性：腐蚀玻璃(17)、石英(98)、硅(188)
 * - 遇水(2)溶解为酸液(9)
 * - 腐蚀金属（除钨、钛、铬外）
 * - 自然消散：一段时间后变为空气
 */

/** 可被氟化氢腐蚀的材质 */
const CORRODE_TARGETS = new Set([
  17, 98, 188, 189, // 玻璃、石英、硅、液态硅
  10, 85, 86, // 金属、铜、锡
]);

/** 免疫氟化氢的材质 */
const IMMUNE = new Set([199, 192, 206]); // 钨、钛、铬

export const HydrogenFluoride: MaterialDef = {
  id: 208,
  name: '氟化氢',
  color() {
    // 几乎无色，微微泛白
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.7) {
      r = 220 + Math.floor(Math.random() * 20);
      g = 225 + Math.floor(Math.random() * 20);
      b = 230 + Math.floor(Math.random() * 20);
    } else {
      r = 200 + Math.floor(Math.random() * 30);
      g = 210 + Math.floor(Math.random() * 25);
      b = 220 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.3,
  update(x: number, y: number, world: WorldAPI) {
    // 自然消散
    if (Math.random() < 0.005) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水溶解为酸液
      if (nid === 2 && Math.random() < 0.2) {
        world.set(x, y, 0);
        world.set(nx, ny, 9); // 酸液
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀玻璃/石英/硅等
      if (CORRODE_TARGETS.has(nid) && !IMMUNE.has(nid) && Math.random() < 0.08) {
        world.set(nx, ny, 7); // 腐蚀为烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 自身消耗
        if (Math.random() < 0.5) {
          world.set(x, y, 0);
          return;
        }
      }
    }

    // === 气体上升逻辑 ===
    // 缓慢上升（比空气略重）
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.4) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上
    if (y > 0 && Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
    }

    // 水平扩散
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
      }
    }
  },
};

registerMaterial(HydrogenFluoride);
