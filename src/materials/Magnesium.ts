import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 镁 —— 极易燃的银白色金属粉末
 * - 固体粉末，密度 2.5，可下落堆积
 * - 极易燃：遇火(6)/火花(28)剧烈燃烧，产生极亮白光
 * - 燃烧温度极高：点燃后设置温度 3000+
 * - 遇水(2)也能燃烧（产生氢气19 + 火6）
 * - 遇酸(9)产生氢气(19)
 * - 银白色金属粉末
 */

/** 点火源 */
const IGNITION = new Set([6, 28]); // 火、火花

export const Magnesium: MaterialDef = {
  id: 185,
  name: '镁',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 银白色
      r = 200 + Math.floor(Math.random() * 25);
      g = 200 + Math.floor(Math.random() * 25);
      b = 210 + Math.floor(Math.random() * 25);
    } else if (t < 0.8) {
      // 亮银高光
      r = 220 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 20);
      b = 230 + Math.floor(Math.random() * 20);
    } else {
      // 略暗银灰
      r = 180 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃（温度>500自动点燃）
    if (temp > 500) {
      // 剧烈燃烧：变为火，设置极高温度，周围产生火花
      world.set(x, y, 6); // 火
      world.setTemp(x, y, 3200);
      world.wakeArea(x, y);
      // 周围产生火花（极亮白光效果）
      const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny) && Math.random() < 0.5) {
          world.set(nx, ny, 28); // 火花
          world.setTemp(nx, ny, 3000);
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
      }
      return;
    }

    // 邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火/火花：剧烈燃烧
      if (IGNITION.has(nid) && Math.random() < 0.6) {
        world.set(x, y, 6); // 火
        world.setTemp(x, y, 3200);
        world.wakeArea(x, y);
        // 周围空位产生火花
        for (const [ddx, ddy] of dirs) {
          const nnx = x + ddx, nny = y + ddy;
          if (world.inBounds(nnx, nny) && world.isEmpty(nnx, nny) && Math.random() < 0.4) {
            world.set(nnx, nny, 28); // 火花
            world.setTemp(nnx, nny, 3000);
            world.markUpdated(nnx, nny);
            world.wakeArea(nnx, nny);
          }
        }
        return;
      }

      // 遇水燃烧：产生氢气 + 火
      if (nid === 2 && Math.random() < 0.08) {
        world.set(x, y, 6);  // 火
        world.set(nx, ny, 19); // 氢气
        world.setTemp(x, y, 3000);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇酸产生氢气
      if (nid === 9 && Math.random() < 0.06) {
        world.set(x, y, 0);   // 镁溶解
        world.set(nx, ny, 19); // 氢气
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 粉末下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < this.density && Math.random() < 0.4) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下堆积
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Magnesium);
