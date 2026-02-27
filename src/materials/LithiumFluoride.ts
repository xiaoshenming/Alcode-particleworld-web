import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氟化锂 —— 白色晶体化合物
 * - 粉末，密度 2.6
 * - 高温 >845° 熔化为液体
 * - 遇酸反应释放有毒气体
 * - 用于核工业和光学材料
 * - 白色微透明晶体
 */

export const LithiumFluoride: MaterialDef = {
  id: 443,
  name: '氟化锂',
  category: '粉末',
  description: '白色晶体化合物，用于核工业和紫外光学窗口',
  density: 2.6,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 235 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 12);
      b = 240 + Math.floor(Math.random() * 10);
    } else {
      r = 245 + Math.floor(Math.random() * 10);
      g = 242 + Math.floor(Math.random() * 8);
      b = 248 + Math.floor(Math.random() * 7);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 845) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸反应释放烟
      if (nid === 9 && Math.random() < 0.06) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢溶解
      if (nid === 2 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 重力下落（粉末）
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

registerMaterial(LithiumFluoride);
