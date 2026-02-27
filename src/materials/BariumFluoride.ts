import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氟化钡 —— 白色晶体化合物
 * - 粉末，密度 3.5
 * - 有毒，遇酸反应释放有毒气体
 * - 高温 >1368° 熔化为液体
 * - 白色微黄晶体颗粒
 */

export const BariumFluoride: MaterialDef = {
  id: 438,
  name: '氟化钡',
  category: '粉末',
  description: '白色晶体化合物，有毒，用于光学窗口和红外透镜',
  density: 3.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 230 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 12);
      b = 210 + Math.floor(Math.random() * 15);
    } else {
      r = 240 + Math.floor(Math.random() * 10);
      g = 235 + Math.floor(Math.random() * 10);
      b = 220 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1368) {
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
      if (nid === 9 && Math.random() < 0.05) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢溶解
      if (nid === 2 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
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

registerMaterial(BariumFluoride);
