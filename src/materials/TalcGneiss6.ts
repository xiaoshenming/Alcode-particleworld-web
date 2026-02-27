import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 滑石片麻岩(6) —— 滑石与片麻岩的高级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 岩浆(11)熔化概率 0.0008 → 熔岩(11)
 * - 热传导 0.04/0.05
 * - 灰白色调，具有滑腻质感
 */

export const TalcGneiss6: MaterialDef = {
  id: 1249,
  name: '滑石片麻岩(6)',
  category: '固体',
  description: '滑石与片麻岩的高级变质岩，具有滑腻质感',
  density: Infinity,
  color() {
    const r = 182 + Math.floor(Math.random() * 22);
    const g = 186 + Math.floor(Math.random() * 22);
    const b = 182 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 热传导
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 岩浆(11)熔化
      if (nid === 11 && Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }

      // 热传导
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(TalcGneiss6);
