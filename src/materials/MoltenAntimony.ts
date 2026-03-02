import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态锑 —— 橙红色发光液体
 * - 低温(<400°)凝固为锑(161)
 * - 点燃可燃物(木4/油5)
 * - 流动性中等
 */
export const MoltenAntimony: MaterialDef = {
  id: 162,
  name: '液态锑',
  color() {
    // 橙红色发光液体
    const r = 240 + Math.floor(Math.random() * 15);
    const g = 100 + Math.floor(Math.random() * 50);
    const b = 20 + Math.floor(Math.random() * 30);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 5.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低温凝固为锑
    if (temp < 400) {
      world.set(x, y, 161); // 锑
      world.setTemp(x, y, temp);
      return;
    }

    // 自身缓慢散热
    if (temp > 420) {
      world.addTemp(x, y, -1);
    }

    // 加热周围环境（显式4方向，无HOF）
    if (world.inBounds(x, y - 1)) {
      if ((world.get(x, y - 1) === 4 || world.get(x, y - 1) === 5) && Math.random() < 0.1) { world.set(x, y - 1, 6); world.markUpdated(x, y - 1); }
      world.addTemp(x, y - 1, 3);
    }
    if (world.inBounds(x, y + 1)) {
      if ((world.get(x, y + 1) === 4 || world.get(x, y + 1) === 5) && Math.random() < 0.1) { world.set(x, y + 1, 6); world.markUpdated(x, y + 1); }
      world.addTemp(x, y + 1, 3);
    }
    if (world.inBounds(x - 1, y)) {
      if ((world.get(x - 1, y) === 4 || world.get(x - 1, y) === 5) && Math.random() < 0.1) { world.set(x - 1, y, 6); world.markUpdated(x - 1, y); }
      world.addTemp(x - 1, y, 3);
    }
    if (world.inBounds(x + 1, y)) {
      if ((world.get(x + 1, y) === 4 || world.get(x + 1, y) === 5) && Math.random() < 0.1) { world.set(x + 1, y, 6); world.markUpdated(x + 1, y); }
      world.addTemp(x + 1, y, 3);
    }

    // 液体物理：下落
    if (y < world.height - 1) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 密度置换
      if (world.getDensity(x, y + 1) < MoltenAntimony.density) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 斜下
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          return;
        }
      }
    }

    // 水平流动
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

registerMaterial(MoltenAntimony);
