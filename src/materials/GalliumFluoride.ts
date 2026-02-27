import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氟化镓 —— 白色粉末状晶体
 * - 粉末，密度 4.5
 * - 高温 >800° 熔化为熔岩
 * - 微溶于水
 * - 遇酸反应
 * - 白色微灰晶体颗粒
 */

export const GalliumFluoride: MaterialDef = {
  id: 488,
  name: '氟化镓',
  category: '粉末',
  description: '白色粉末状晶体，用于光学薄膜和催化剂',
  density: 4.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 235 + Math.floor(Math.random() * 12);
      g = 233 + Math.floor(Math.random() * 10);
      b = 230 + Math.floor(Math.random() * 10);
    } else {
      r = 245 + Math.floor(Math.random() * 8);
      g = 243 + Math.floor(Math.random() * 8);
      b = 240 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 800) {
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

      if (nid === 9 && Math.random() < 0.06) {
        world.set(x, y, 7);
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

registerMaterial(GalliumFluoride);
