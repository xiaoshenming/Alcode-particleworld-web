import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 锌 —— 蓝白色金属
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>419°)熔化为液态锌(222)
 * - 遇酸反应产生氢气(19)
 * - 遇水缓慢氧化（表面钝化）
 * - 蓝白色带微灰色调
 */

const ACIDS = new Set([9, 173, 183, 159]); // 酸液、硫酸、硝酸、磷酸

export const Zinc: MaterialDef = {
  id: 221,
  name: '锌',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 蓝白色
      const base = 170 + Math.floor(Math.random() * 25);
      r = base - 5;
      g = base;
      b = base + 10;
    } else if (phase < 0.85) {
      // 灰色调
      const base = 155 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 8;
    } else {
      // 高光
      const base = 195 + Math.floor(Math.random() * 25);
      r = base - 3;
      g = base;
      b = base + 8;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 419) {
      world.set(x, y, 222); // 液态锌
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸反应产生氢气
      if (ACIDS.has(nid) && Math.random() < 0.02) {
        world.set(x, y, 0); // 锌溶解
        world.set(nx, ny, 19); // 酸变氢气
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Zinc);
