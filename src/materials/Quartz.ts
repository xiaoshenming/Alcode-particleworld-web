import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 石英 —— 透明结晶固体
 * - 不可移动，密度无限
 * - 高温(>250°)熔化为液态玻璃(92)
 * - 雷电(16)击中时碎裂为沙子(1)
 * - 酸液(9)缓慢腐蚀
 * - 接触熔岩(11)时缓慢熔化
 * - 视觉上呈半透明白色/淡粉色晶体
 */

export const Quartz: MaterialDef = {
  id: 98,
  name: '石英',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 半透明白色
      r = 220 + Math.floor(Math.random() * 30);
      g = 215 + Math.floor(Math.random() * 30);
      b = 225 + Math.floor(Math.random() * 30);
    } else if (t < 0.8) {
      // 淡粉色
      r = 230 + Math.floor(Math.random() * 25);
      g = 200 + Math.floor(Math.random() * 20);
      b = 210 + Math.floor(Math.random() * 20);
    } else {
      // 高光闪烁
      r = 240 + Math.floor(Math.random() * 15);
      g = 238 + Math.floor(Math.random() * 15);
      b = 245 + Math.floor(Math.random() * 10);
    }
    return (0xE0 << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为液态玻璃
    if (temp > 250) {
      world.set(x, y, 92); // 液态玻璃
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 雷电击碎
      if (nid === 16) {
        world.set(x, y, 1); // 沙子
        world.wakeArea(x, y);
        return;
      }

      // 酸液腐蚀
      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 1); // 沙子
        world.set(nx, ny, 0); // 酸液消耗
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 接触熔岩缓慢熔化
      if (nid === 11 && Math.random() < 0.02) {
        world.set(x, y, 92); // 液态玻璃
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Quartz);
