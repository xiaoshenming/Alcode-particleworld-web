import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氟化铍 —— 白色玻璃状晶体
 * - 粉末，密度 1.99
 * - 高温 >554° 熔化为熔岩
 * - 微溶于水
 * - 剧毒，遇酸反应释放毒气
 * - 白色玻璃状颗粒
 */

export const BerylliumFluoride: MaterialDef = {
  id: 498,
  name: '氟化铍',
  category: '粉末',
  description: '白色玻璃状剧毒晶体，用于核反应堆冷却盐和光学材料',
  density: 1.99,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 240 + Math.floor(Math.random() * 10);
      g = 242 + Math.floor(Math.random() * 10);
      b = 245 + Math.floor(Math.random() * 8);
    } else {
      r = 250 + Math.floor(Math.random() * 5);
      g = 251 + Math.floor(Math.random() * 4);
      b = 252 + Math.floor(Math.random() * 3);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 554) {
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

      // 遇酸反应释放毒气
      if (nid === 9 && Math.random() < 0.07) {
        world.set(x, y, 18); // 毒气
        world.wakeArea(x, y);
        return;
      }

      if (nid === 2 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    if (world.inBounds(x, y + 1)) {
      if (world.get(x, y + 1) === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.get(x + dir, y + 1) === 0) {
        world.swap(x, y, x + dir, y + 1);
        world.wakeArea(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(BerylliumFluoride);
