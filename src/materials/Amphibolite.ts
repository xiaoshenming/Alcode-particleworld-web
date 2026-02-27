import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 角闪岩 —— 中高级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 深色，以角闪石为主要矿物
 * - 高温(>1050°)熔化为熔岩
 * - 较耐酸
 * - 低导热
 */

export const Amphibolite: MaterialDef = {
  id: 279,
  name: '角闪岩',
  category: '矿石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰黑
      r = 35 + Math.floor(Math.random() * 15);
      g = 38 + Math.floor(Math.random() * 15);
      b = 40 + Math.floor(Math.random() * 15);
    } else if (phase < 0.7) {
      // 暗绿灰
      r = 30 + Math.floor(Math.random() * 15);
      g = 42 + Math.floor(Math.random() * 15);
      b = 35 + Math.floor(Math.random() * 12);
    } else if (phase < 0.9) {
      // 深褐灰
      r = 45 + Math.floor(Math.random() * 15);
      g = 38 + Math.floor(Math.random() * 12);
      b = 32 + Math.floor(Math.random() * 10);
    } else {
      // 浅色条纹
      const base = 80 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 3;
      b = base - 2;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1050) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 较耐酸
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸
      if ((nid === 173 || nid === 183) && Math.random() < 0.018) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 低导热
      if (nid !== 0 && Math.random() < 0.035) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Amphibolite);
