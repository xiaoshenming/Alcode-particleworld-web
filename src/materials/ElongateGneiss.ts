import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 拉长片麻岩 —— 含拉长石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1220° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 灰蓝色带虹彩斑晶
 */

export const ElongateGneiss: MaterialDef = {
  id: 654,
  name: '拉长片麻岩',
  category: '固体',
  description: '含拉长石矿物的片麻岩，具有独特的虹彩光泽',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 95 + Math.floor(Math.random() * 12);
      g = 105 + Math.floor(Math.random() * 10);
      b = 118 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 110 + Math.floor(Math.random() * 10);
      g = 120 + Math.floor(Math.random() * 10);
      b = 135 + Math.floor(Math.random() * 10);
    } else {
      r = 80 + Math.floor(Math.random() * 10);
      g = 90 + Math.floor(Math.random() * 10);
      b = 105 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1220) {
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

registerMaterial(ElongateGneiss);
