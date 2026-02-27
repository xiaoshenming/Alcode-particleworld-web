import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钯钆合金 —— 钯与钆的合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1800° → 液态钯钆(1242)
 * - 酸液溶解 0.001
 * - 热传导 0.08/0.09
 * - 银黄色调金属
 */

export const PalladiumGadoliniumAlloy: MaterialDef = {
  id: 1241,
  name: '钯钆合金',
  category: '固体',
  description: '钯与钆的合金，结合钯的催化性与钆的磁性特性',
  density: Infinity,
  color() {
    const r = 190 + Math.floor(Math.random() * 18);
    const g = 186 + Math.floor(Math.random() * 18);
    const b = 180 + Math.floor(Math.random() * 18);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔点 >1800° → 液态钯钆(1242)
    if (temp > 1800) {
      world.set(x, y, 1242);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液(9)溶解 0.001
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 热传导 0.08/0.09
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.09;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(PalladiumGadoliniumAlloy);
