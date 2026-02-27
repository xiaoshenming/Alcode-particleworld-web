import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 红柱石片麻岩(7) —— 红柱石与片麻岩的高级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 具有十字形晶体纹理
 * - 岩浆(11)熔化概率 0.0008
 * - 热传导 0.04/0.05
 * - 粉棕灰色调
 */

export const AndalusiteGneiss7: MaterialDef = {
  id: 1234,
  name: '红柱石片麻岩(7)',
  category: '固体',
  description: '红柱石与片麻岩的高级变质岩,具有十字形晶体纹理',
  density: Infinity,
  color() {
    const r = 178 + Math.floor(Math.random() * 22);
    const g = 148 + Math.floor(Math.random() * 22);
    const b = 142 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 岩浆熔化
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 岩浆熔化
      if (nid === 11 && Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.setTemp(x, y, 1200);
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

registerMaterial(AndalusiteGneiss7);
