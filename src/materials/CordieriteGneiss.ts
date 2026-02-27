import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 堇青片麻岩 —— 含堇青石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1150° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 灰蓝紫色带堇青石斑晶
 */

export const CordieriteGneiss: MaterialDef = {
  id: 669,
  name: '堇青片麻岩',
  category: '固体',
  description: '含堇青石矿物的片麻岩，属于高级区域变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 88 + Math.floor(Math.random() * 12);
      g = 82 + Math.floor(Math.random() * 10);
      b = 108 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 102 + Math.floor(Math.random() * 10);
      g = 95 + Math.floor(Math.random() * 10);
      b = 122 + Math.floor(Math.random() * 10);
    } else {
      r = 75 + Math.floor(Math.random() * 10);
      g = 68 + Math.floor(Math.random() * 10);
      b = 95 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1150) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

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

registerMaterial(CordieriteGneiss);
