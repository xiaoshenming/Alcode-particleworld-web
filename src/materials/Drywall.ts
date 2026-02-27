import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 石膏板 —— 建筑用石膏板材
 * - 固体，密度 Infinity（不可移动）
 * - 遇水缓慢软化溶解（变为泥浆63）
 * - 可燃但不易燃：>400° 才分解
 * - 遇酸缓慢腐蚀
 * - 白色/米色
 */

export const Drywall: MaterialDef = {
  id: 219,
  name: '石膏板',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 白色
      r = 225 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 20);
      b = 210 + Math.floor(Math.random() * 20);
    } else if (phase < 0.85) {
      // 米色
      r = 220 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 20);
    } else {
      // 浅灰色纹理
      const base = 195 + Math.floor(Math.random() * 20);
      r = base;
      g = base - 2;
      b = base - 5;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 400) {
      world.set(x, y, 7); // 变烟
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水软化溶解
      if (nid === 2 && Math.random() < 0.008) {
        world.set(x, y, 63); // 变泥浆
        world.wakeArea(x, y);
        return;
      }

      // 遇酸腐蚀
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 遇火缓慢着火
      if (nid === 6 && Math.random() < 0.01) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Drywall);
