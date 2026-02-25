import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 笑气（一氧化二氮 N2O）—— 麻醉性气体
 * - 气体，密度 0.4（比空气略重）
 * - 助燃：遇火/火花时增强燃烧（使火焰扩散）
 * - 麻醉：使蚂蚁(40)、萤火虫(52)停止运动（消灭）
 * - 高温(>575°)分解为空气
 * - 无色微甜（视觉上极淡）
 */

export const NitrousOxide: MaterialDef = {
  id: 248,
  name: '笑气',
  color() {
    const base = 215 + Math.floor(Math.random() * 30);
    const r = base;
    const g = base + 3;
    const b = base + 8;
    const a = 0x50 + Math.floor(Math.random() * 0x30);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.4,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 575) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 自然消散
    if (Math.random() < 0.004) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 助燃：遇火时在自身位置也生成火
      if ((nid === 6 || nid === 28) && Math.random() < 0.3) {
        world.set(x, y, 6);
        world.wakeArea(x, y);
        return;
      }

      // 麻醉生物
      if ((nid === 40 || nid === 52) && Math.random() < 0.03) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体运动 ===
    // 略重于空气，缓慢下沉
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.1) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 横向扩散
    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 偶尔上升
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.12) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(NitrousOxide);
