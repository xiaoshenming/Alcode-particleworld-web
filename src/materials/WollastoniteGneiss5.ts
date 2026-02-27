import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硅灰石片麻岩(5) —— 硅灰石与片麻岩的高级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 具有纤维状晶体纹理
 * - 熔点 >1060° → 熔岩(11)
 * - 灰白色调
 */

export const WollastoniteGneiss5: MaterialDef = {
  id: 1239,
  name: '硅灰石片麻岩(5)',
  category: '固体',
  description: '硅灰石与片麻岩的高级变质岩,具有纤维状晶体纹理',
  density: Infinity,
  color() {
    const r = 178 + Math.floor(Math.random() * 22);
    const g = 182 + Math.floor(Math.random() * 22);
    const b = 186 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1060 && Math.random() < 0.0008) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

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

registerMaterial(WollastoniteGneiss5);
