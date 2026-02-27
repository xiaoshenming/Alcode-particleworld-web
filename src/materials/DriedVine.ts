import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 干枯藤蔓 —— 枯死的攀爬植物
 * - 固体，密度 Infinity（不可移动，挂在墙上）
 * - 极易燃：遇火(6)/火花(28)立即点燃变为火
 * - 遇水(2)缓慢恢复为藤蔓(57)
 * - 枯黄棕色外观
 */

export const DriedVine: MaterialDef = {
  id: 172,
  name: '干枯藤蔓',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 枯黄色
      r = 140 + Math.floor(Math.random() * 30);
      g = 100 + Math.floor(Math.random() * 25);
      b = 40 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗棕色
      r = 110 + Math.floor(Math.random() * 25);
      g = 75 + Math.floor(Math.random() * 20);
      b = 30 + Math.floor(Math.random() * 15);
    } else {
      // 浅黄高光（干枯纤维）
      r = 170 + Math.floor(Math.random() * 25);
      g = 130 + Math.floor(Math.random() * 20);
      b = 60 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固定不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃
    if (temp > 60) {
      world.set(x, y, 6); // 火
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极易燃：遇火/火花立即点燃
      if ((nid === 6 || nid === 28) && Math.random() < 0.5) {
        world.set(x, y, 6); // 火
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢恢复为藤蔓
      if (nid === 2 && Math.random() < 0.01) {
        world.set(x, y, 57); // 藤蔓
        world.markUpdated(x, y);
        world.wakeArea(x, y);
        return;
      }

      // 遇酸液被溶解
      if (nid === 9 && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(DriedVine);
