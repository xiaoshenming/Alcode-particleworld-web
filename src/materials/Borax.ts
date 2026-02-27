import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硼砂 —— 白色粉末，助焊剂
 * - 粉末，密度 2.5，可下落堆积
 * - 助焊剂：遇液态金属(113)/熔岩(11)降低凝固温度（给邻居加温+20）
 * - 遇水(2)溶解（自身消失，水保留）
 * - 遇火(6)产生绿色火焰效果（自身变为火）
 * - 白色细粉
 */

/** 可被助焊的高温材质 */
const FLUX_TARGETS = new Set([113, 11]); // 液态金属、熔岩

export const Borax: MaterialDef = {
  id: 201,
  name: '硼砂',
  color() {
    // 白色细粉，带微灰
    const base = 225 + Math.floor(Math.random() * 30);
    const r = base;
    const g = base - Math.floor(Math.random() * 5);
    const b = base - Math.floor(Math.random() * 8);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    // 检查四邻交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水溶解：自身消失，水保留
      if (nid === 2) {
        world.set(x, y, 0); // 空气
        world.wakeArea(x, y);
        return;
      }

      // 遇火产生绿色火焰（自身变为火）
      if (nid === 6) {
        world.set(x, y, 6); // 变为火
        world.wakeArea(x, y);
        return;
      }

      // 助焊剂：遇液态金属/熔岩，给邻居加温+20
      if (FLUX_TARGETS.has(nid)) {
        world.addTemp(nx, ny, 20);
        world.wakeArea(nx, ny);
        // 助焊消耗：小概率自身消失
        if (Math.random() < 0.05) {
          world.set(x, y, 0);
          world.wakeArea(x, y);
          return;
        }
      }
    }

    // 粉末下落逻辑
    if (y >= world.height - 1) return;

    // 直接下落（空气或密度更低的液体）
    const belowEmpty = world.isEmpty(x, y + 1);
    const belowDensity = world.getDensity(x, y + 1);
    if (belowEmpty || (belowDensity < Borax.density && belowDensity > 0)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下堆积
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const sx = x + d;
      if (world.inBounds(sx, y + 1)) {
        const sEmpty = world.isEmpty(sx, y + 1);
        const sDensity = world.getDensity(sx, y + 1);
        if (sEmpty || (sDensity < Borax.density && sDensity > 0)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Borax);
