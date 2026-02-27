import type { MaterialDef, WorldAPI } from './types';
import { DIRS4 } from './types';
import { registerMaterial } from './registry';

/**
 * 钨 —— 深灰色带银色金属光泽的固体
 * - 密度 Infinity（不可移动）
 * - 最耐高温：>3422° 才熔化为液态钨(200)
 * - 完全耐腐蚀：遇任何酸都不受影响
 * - 极高密度，不被爆炸破坏
 */

/** 酸性材质 ID（钨完全免疫） */
const ACIDS = new Set([9, 159, 183]); // 酸液、磷酸、硝酸

export const Tungsten: MaterialDef = {
  id: 199,
  name: '钨',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.7) {
      // 深灰色基底
      const base = 90 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 2;
      b = base + 5;
    } else {
      // 银色金属光泽高光
      const base = 140 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 5;
      b = base + 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体不可移动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超高温(>3422°)熔化为液态钨
    if (temp > 3422) {
      world.set(x, y, 200); // 液态钨
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻：完全耐腐蚀
    for (const [dx, dy] of DIRS4) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液接触钨无效，但酸液自身会被中和消耗
      if (ACIDS.has(nid) && Math.random() < 0.01) {
        world.set(nx, ny, 7); // 酸蒸发为烟（钨不受损）
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 钨不移动，无其他行为
  },
};

registerMaterial(Tungsten);
