import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 矽卡岩 —— 接触交代变质岩，含石榴石和辉石
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1100° → 熔岩(11)
 * - 耐酸(9)：缓慢溶解
 * - 中等导热(0.05)
 * - 棕绿色带暗红斑点
 */

export const Skarn: MaterialDef = {
  id: 319,
  name: '矽卡岩',
  category: '矿石',
  description: '接触交代变质岩，含石榴石和辉石',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 棕绿基质
      r = 80 + Math.floor(Math.random() * 20);
      g = 90 + Math.floor(Math.random() * 20);
      b = 55 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗红斑点（石榴石）
      r = 120 + Math.floor(Math.random() * 30);
      g = 50 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 10);
    } else {
      // 暗绿
      r = 60 + Math.floor(Math.random() * 15);
      g = 75 + Math.floor(Math.random() * 15);
      b = 50 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1100) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸但缓慢溶解
      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Skarn);
