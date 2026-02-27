import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽 —— 高熔点稀有金属，极耐腐蚀
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>3017° → 变为液态钽(297)
 * - 极耐腐蚀：普通酸几乎无效，强酸极慢腐蚀
 * - 良好导热（概率0.1）
 * - 蓝灰色带金属光泽
 */

export const Tantalum: MaterialDef = {
  id: 296,
  name: '钽',
  category: '金属',
  description: '高熔点稀有金属，极耐腐蚀',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 蓝灰
      const base = 140 + Math.floor(Math.random() * 20);
      r = base - 5;
      g = base + 2;
      b = base + 18;
    } else if (phase < 0.7) {
      // 暗蓝灰
      const base = 115 + Math.floor(Math.random() * 15);
      r = base - 8;
      g = base;
      b = base + 22;
    } else {
      // 高光银蓝
      const base = 190 + Math.floor(Math.random() * 25);
      r = base - 3;
      g = base + 5;
      b = base + 15;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高熔点：>3017° 熔化为液态钽
    if (temp > 3017) {
      world.set(x, y, 297);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐腐蚀：普通酸(9)几乎无效
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 酸被消耗变烟
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸(硫酸173/硝酸183)极慢腐蚀
      if ((nid === 173 || nid === 183) && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 酸被消耗变烟
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 良好导热
      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Tantalum);
