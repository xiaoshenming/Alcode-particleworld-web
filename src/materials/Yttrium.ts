import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钇 —— 稀土金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1526° → 液态钇(442)
 * - 遇酸缓慢溶解
 * - 银灰色金属光泽
 */

export const Yttrium: MaterialDef = {
  id: 441,
  name: '钇',
  category: '金属',
  description: '稀土金属，银灰色，用于超导材料和激光晶体',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 180 + Math.floor(Math.random() * 15);
      g = 185 + Math.floor(Math.random() * 12);
      b = 190 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 195 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 10);
      b = 205 + Math.floor(Math.random() * 12);
    } else {
      r = 165 + Math.floor(Math.random() * 12);
      g = 170 + Math.floor(Math.random() * 10);
      b = 178 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1526) {
      world.set(x, y, 442);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸缓慢溶解
      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.06) {
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

registerMaterial(Yttrium);
