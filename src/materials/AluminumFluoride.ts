import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氟化铝 —— 白色无机化合物气体
 * - 气体，密度 0.4（上浮）
 * - 有毒，腐蚀金属和植物
 * - 遇水反应生成烟
 * - 高温 >1290° 分解消散
 * - 白色半透明气体
 */

export const AluminumFluoride: MaterialDef = {
  id: 433,
  name: '氟化铝',
  category: '气体',
  description: '白色无机化合物气体，有毒，用于铝冶炼',
  density: 0.4,
  color() {
    const a = 0xBB + Math.floor(Math.random() * 0x33);
    const r = 225 + Math.floor(Math.random() * 20);
    const g = 228 + Math.floor(Math.random() * 15);
    const b = 235 + Math.floor(Math.random() * 15);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1290) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水反应
      if (nid === 2 && Math.random() < 0.06) {
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀金属
      if (nid === 10 && Math.random() < 0.01) {
        world.set(nx, ny, 72); // 铁锈
        world.wakeArea(nx, ny);
      }

      // 腐蚀植物
      if ((nid === 4 || nid === 13) && Math.random() < 0.03) {
        world.set(nx, ny, 0);
        world.wakeArea(nx, ny);
      }
    }

    // 上浮
    if (y > 0 && world.get(x, y - 1) === 0) {
      world.swap(x, y, x, y - 1);
      world.wakeArea(x, y - 1);
      return;
    }

    // 随机漂移
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.get(x + dir, y) === 0) {
        world.swap(x, y, x + dir, y);
        world.wakeArea(x + dir, y);
        return;
      }
    }

    // 自然消散
    if (Math.random() < 0.002) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(AluminumFluoride);
