import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氟化铊 —— 白色有毒晶体
 * - 粉末，密度 8.4
 * - 高温 >326° 熔化为熔岩
 * - 剧毒，遇水溶解
 * - 遇酸反应
 * - 白色晶体颗粒
 */

export const ThalliumFluoride: MaterialDef = {
  id: 478,
  name: '氟化铊',
  category: '粉末',
  description: '白色剧毒晶体，用于红外光学材料和特种玻璃',
  density: 8.4,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 235 + Math.floor(Math.random() * 12);
      g = 232 + Math.floor(Math.random() * 10);
      b = 225 + Math.floor(Math.random() * 12);
    } else {
      r = 245 + Math.floor(Math.random() * 8);
      g = 242 + Math.floor(Math.random() * 8);
      b = 235 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 326) {
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

      // 遇水溶解
      if (nid === 2 && Math.random() < 0.05) {
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

registerMaterial(ThalliumFluoride);
