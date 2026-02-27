import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氟化钠 —— 白色晶体化合物
 * - 粉末，密度 2.8
 * - 高温 >993° 熔化为液体
 * - 遇酸反应释放有毒气体
 * - 用于牙膏和冶金助熔剂
 * - 白色晶体颗粒
 */

export const SodiumFluoride: MaterialDef = {
  id: 453,
  name: '氟化钠',
  category: '粉末',
  description: '白色晶体化合物，用于牙膏添加剂和冶金助熔剂',
  density: 2.8,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 238 + Math.floor(Math.random() * 12);
      g = 236 + Math.floor(Math.random() * 10);
      b = 232 + Math.floor(Math.random() * 12);
    } else {
      r = 248 + Math.floor(Math.random() * 7);
      g = 245 + Math.floor(Math.random() * 6);
      b = 242 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 993) {
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

      if (nid === 9 && Math.random() < 0.05) {
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }

      // 遇水溶解（氟化钠易溶于水）
      if (nid === 2 && Math.random() < 0.02) {
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

registerMaterial(SodiumFluoride);
