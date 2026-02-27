import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 角页岩 —— 接触变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1300° → 熔岩(11)
 * - 耐酸较强（概率0.005）
 * - 导热较慢
 * - 深灰色带细密纹理
 */

export const Hornfels: MaterialDef = {
  id: 399,
  name: '角页岩',
  category: '矿石',
  description: '接触变质形成的致密岩石，深灰色带细密纹理，质地坚硬',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰色
      const base = 90 + Math.floor(Math.random() * 18);
      r = base;
      g = base + 2;
      b = base + 3;
    } else if (phase < 0.65) {
      // 暗灰带微棕
      r = 100 + Math.floor(Math.random() * 12);
      g = 95 + Math.floor(Math.random() * 10);
      b = 88 + Math.floor(Math.random() * 10);
    } else if (phase < 0.85) {
      // 中灰色
      const base = 115 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 1;
      b = base + 2;
    } else {
      // 浅灰斑点
      const base = 135 + Math.floor(Math.random() * 18);
      r = base;
      g = base - 2;
      b = base + 3;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1300) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸较强
      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 导热较慢
      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Hornfels);
