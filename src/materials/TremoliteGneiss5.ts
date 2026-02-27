import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 透闪石片麻岩(5) —— 透闪石与片麻岩的高级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1070° → 熔岩(11)
 * - 耐酸腐蚀
 * - 灰绿色调，纤维状晶体纹理
 */

export const TremoliteGneiss5: MaterialDef = {
  id: 1244,
  name: '透闪石片麻岩(5)',
  category: '固体',
  description: '透闪石与片麻岩的高级变质岩，具有纤维状晶体纹理',
  density: Infinity,
  color() {
    const r = 148 + Math.floor(Math.random() * 22);
    const g = 162 + Math.floor(Math.random() * 22);
    const b = 156 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔岩熔化
    if (temp > 1070) {
      if (Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.setTemp(x, y, temp);
        world.wakeArea(x, y);
        return;
      }
    }

    // 热传导
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(TremoliteGneiss5);
