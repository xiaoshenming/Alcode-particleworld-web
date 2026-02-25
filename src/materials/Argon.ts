import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氩气 —— 惰性气体
 * - 气体，密度 0.5（比空气略重）
 * - 完全惰性：不与任何材质反应
 * - 阻燃：扑灭邻近的火(6)和火花(28)
 * - 隔热：减缓邻近温度传导
 * - 无色（视觉上极淡紫色调）
 * - 缓慢消散
 */

export const Argon: MaterialDef = {
  id: 258,
  name: '氩气',
  category: '气体',
  color() {
    const base = 200 + Math.floor(Math.random() * 40);
    const r = base - 5;
    const g = base - 8;
    const b = base + 5;
    const a = 0x40 + Math.floor(Math.random() * 0x25);
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.5,
  update(x: number, y: number, world: WorldAPI) {
    // 缓慢消散
    if (Math.random() < 0.003) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻：阻燃效果
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 扑灭火焰和火花
      if ((nid === 6 || nid === 28) && Math.random() < 0.4) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 隔热：将邻居温度向常温拉回
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(nt - 20) > 10) {
          world.addTemp(nx, ny, (20 - nt) * 0.02);
        }
      }
    }

    // === 气体运动 ===
    // 略重于空气，偶尔下沉
    if (y < world.height - 1 && world.isEmpty(x, y + 1) && Math.random() < 0.08) {
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
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.1) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
    }
  },
};

registerMaterial(Argon);
