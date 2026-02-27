import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 汞合金 —— 水银与金属的合金，粘稠液态金属
 * - 液体，密度 10.0（极重，比水银还重）
 * - 缓慢分离：极低概率分解为水银(56)+金属(10)
 * - 遇酸(9)释放水银(56)
 * - 银色带金色光泽的粘稠液体
 * - 流动较慢（高粘度）
 */

export const Amalgam: MaterialDef = {
  id: 187,
  name: '汞合金',
  color() {
    // 银色带金色光泽
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 银白色基底
      const base = 175 + Math.floor(Math.random() * 40);
      r = base + Math.floor(Math.random() * 10);
      g = base - 5 + Math.floor(Math.random() * 10);
      b = base - 10 + Math.floor(Math.random() * 10);
    } else {
      // 金色光泽
      r = 200 + Math.floor(Math.random() * 30);
      g = 180 + Math.floor(Math.random() * 25);
      b = 100 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 10.0,
  update(x: number, y: number, world: WorldAPI) {
    // 极低概率自然分解为水银 + 金属
    if (Math.random() < 0.0005) {
      world.set(x, y, 56); // 水银
      // 尝试在邻居空位放置金属碎片
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
          world.set(nx, ny, 10); // 金属
          world.markUpdated(nx, ny);
          break;
        }
      }
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸释放水银
      if (nid === 9 && Math.random() < 0.08) {
        world.set(x, y, 56); // 变水银
        world.set(nx, ny, 0);  // 酸被消耗
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }

    if (y >= world.height - 1) return;

    // 缓慢下落（高粘度，概率控制流速）
    if (Math.random() < 0.4) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 密度置换：极重，沉入几乎所有液体
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < Amalgam.density && belowDensity !== Infinity) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 斜下流动
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

    // 极缓慢水平扩散
    if (Math.random() < 0.08) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(Amalgam);
