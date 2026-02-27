import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 氟化钾 —— 白色晶体盐
 * - 粉末，密度 2.5
 * - 高温 >858° 熔化为液体（变为熔岩代替）
 * - 遇水极易溶解
 * - 遇酸反应释放气体
 * - 白色微带灰的晶体颗粒
 */

export const PotassiumFluoride: MaterialDef = {
  id: 458,
  name: '氟化钾',
  category: '粉末',
  description: '白色晶体盐，极易溶于水，用于有机合成和蚀刻玻璃',
  density: 2.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 235 + Math.floor(Math.random() * 12);
      g = 232 + Math.floor(Math.random() * 10);
      b = 228 + Math.floor(Math.random() * 12);
    } else {
      r = 245 + Math.floor(Math.random() * 8);
      g = 240 + Math.floor(Math.random() * 8);
      b = 238 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 858) {
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

      // 遇酸反应
      if (nid === 9 && Math.random() < 0.06) {
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }

      // 极易溶于水
      if (nid === 2 && Math.random() < 0.04) {
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

    // 粉末下落
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

registerMaterial(PotassiumFluoride);
