import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌 —— 超导金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 2477° → 变为液态铌(277)
 * - 低温(<-263°/10K)时变为超导体：完全导热无损耗
 * - 耐腐蚀性好
 * - 灰蓝色光泽
 */

export const Niobium: MaterialDef = {
  id: 276,
  name: '铌',
  category: '金属',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 灰蓝
      const base = 160 + Math.floor(Math.random() * 20);
      r = base - 10;
      g = base - 5;
      b = base + 10;
    } else if (phase < 0.7) {
      // 银灰
      const base = 180 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 2;
      b = base + 8;
    } else {
      // 高光
      const base = 200 + Math.floor(Math.random() * 25);
      r = base - 5;
      g = base;
      b = base + 12;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 2477) {
      world.set(x, y, 277);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 超导模式：极低温时完美导热
    const superconductive = temp < 10;

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐腐蚀
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.003) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 导热（超导时完美传导）
      if (nid !== 0) {
        const rate = superconductive ? 0.5 : 0.1;
        if (Math.random() < rate) {
          const nt = world.getTemp(nx, ny);
          if (Math.abs(temp - nt) > 2) {
            const avg = (temp + nt) / 2;
            world.setTemp(x, y, avg);
            world.setTemp(nx, ny, avg);
          }
        }
      }
    }
  },
};

registerMaterial(Niobium);
