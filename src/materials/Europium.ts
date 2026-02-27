import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铕 —— 稀土金属，荧光材料的关键元素
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>822° → 液态铕(352)
 * - 受紫外线(激光47/光束48)激发时发出红色荧光：周围空气变为荧光粉(133)
 * - 耐酸(9)较弱（活泼稀土）
 * - 银白色带微黄
 */

export const Europium: MaterialDef = {
  id: 351,
  name: '铕',
  category: '金属',
  description: '稀土金属，荧光材料的关键元素，受激发出红色荧光',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 195 + Math.floor(Math.random() * 15);
      g = 190 + Math.floor(Math.random() * 15);
      b = 180 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      const base = 170 + Math.floor(Math.random() * 15);
      r = base + 5;
      g = base + 2;
      b = base;
    } else {
      r = 215 + Math.floor(Math.random() * 15);
      g = 208 + Math.floor(Math.random() * 12);
      b = 195 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 822) {
      world.set(x, y, 352);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 受激光/光束激发 → 周围空气变荧光粉
      if ((nid === 47 || nid === 48) && Math.random() < 0.15) {
        for (const [dx2, dy2] of dirs) {
          const fx = x + dx2, fy = y + dy2;
          if (world.inBounds(fx, fy) && world.isEmpty(fx, fy) && Math.random() < 0.4) {
            world.set(fx, fy, 133); // 荧光粉
            world.wakeArea(fx, fy);
          }
        }
      }

      // 耐酸较弱
      if (nid === 9 && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.05) {
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

registerMaterial(Europium);
