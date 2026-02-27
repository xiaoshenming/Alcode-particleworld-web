import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 六氟化硫 —— 强温室气体，优良绝缘介质
 * - 气体，密度 -0.05（极重气体，几乎不上升）
 * - 绝缘：阻断闪电(16)/电弧(145)/导线(43)传导
 * - 高温(>500°) → 分解为烟(7)
 * - 无色无味，微带绿色调
 */

export const SulfurHexafluoride: MaterialDef = {
  id: 348,
  name: '六氟化硫',
  category: '气体',
  description: '强温室气体，优良电气绝缘介质',
  density: -0.05,
  color() {
    const r = 190 + Math.floor(Math.random() * 25);
    const g = 210 + Math.floor(Math.random() * 25);
    const b = 200 + Math.floor(Math.random() * 25);
    const a = 30 + Math.floor(Math.random() * 20);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 500) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    // 绝缘效果：消灭相邻闪电/电弧
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if ((nid === 16 || nid === 145) && Math.random() < 0.5) {
        world.set(nx, ny, 0);
        world.wakeArea(nx, ny);
      }
    }

    // 极重气体：缓慢上升
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.15) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 更倾向于下沉（比空气重得多）
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.3) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 水平扩散
    for (let d = 1; d <= 2; d++) {
      const nx = x + (Math.random() < 0.5 ? d : -d);
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 缓慢消散
    if (Math.random() < 0.0005) {
      world.set(x, y, 0);
    }
  },
};

registerMaterial(SulfurHexafluoride);
