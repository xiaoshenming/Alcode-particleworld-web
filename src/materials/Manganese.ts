import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 锰 —— 银灰色硬脆金属
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>1246°)熔化为液态锰(212)
 * - 遇酸缓慢腐蚀
 * - 遇水缓慢氧化生锈（变为铁锈色）
 */

const ACIDS = new Set([9, 159, 173, 183]); // 酸液、磷酸、硫酸、硝酸

export const Manganese: MaterialDef = {
  id: 211,
  name: '锰',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 银灰色基底
      const base = 150 + Math.floor(Math.random() * 25);
      r = base - 5;
      g = base;
      b = base + 3;
    } else if (phase < 0.85) {
      // 暗灰色
      const base = 120 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else {
      // 微粉色调（锰特有）
      const base = 140 + Math.floor(Math.random() * 20);
      r = base + 15;
      g = base;
      b = base + 5;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1246) {
      world.set(x, y, 212); // 液态锰
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸腐蚀
      if (ACIDS.has(nid) && Math.random() < 0.01) {
        world.set(x, y, 0); // 锰溶解
        world.set(nx, ny, 7); // 酸变烟
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢氧化
      if (nid === 2 && Math.random() < 0.002) {
        world.set(x, y, 72); // 变铁锈
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Manganese);
