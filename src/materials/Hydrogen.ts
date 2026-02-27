import { DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 点火源 */
const IGNITION = new Set([6, 11, 16]); // 火、熔岩、雷电

/**
 * 氢气 —— 极轻气体，快速上升
 * - 遇火/熔岩/雷电 → 爆炸（周围产生火焰）
 * - 比所有材质都轻，快速上浮
 */
export const Hydrogen: MaterialDef = {
  id: 19,
  name: '氢气',
  color() {
    const r = 100 + Math.floor(Math.random() * 30);
    const g = 150 + Math.floor(Math.random() * 30);
    const b = 220 + Math.floor(Math.random() * 35);
    return (0xAA << 24) | (b << 16) | (g << 8) | r; // 半透明淡蓝
  },
  density: 0.01, // 极轻
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居：遇点火源爆炸
    for (const [dx, dy] of DIRS8) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (IGNITION.has(world.get(nx, ny))) {
        // 爆炸：自身及周围 3x3 区域变火
        explode(x, y, world);
        return;
      }
    }

    // 快速上升
    if (y > 0 && world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      // 连续上升两格（快速）
      if (y - 2 >= 0 && world.isEmpty(x, y - 2)) {
        world.swap(x, y - 1, x, y - 2);
        world.markUpdated(x, y - 2);
      }
      return;
    }

    // 斜上
    if (y > 0) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 水平扩散
    if (Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
      }
    }
  },
};

/** 爆炸：中心 3x3 区域变火，外圈有概率 */
function explode(cx: number, cy: number, world: WorldAPI): void {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (!world.inBounds(nx, ny)) continue;

      const dist = dx * dx + dy * dy;
      const nid = world.get(nx, ny);

      // 中心区域（距离<=2）：必定变火
      if (dist <= 2) {
        if (nid === 0 || nid === 19) {
          world.set(nx, ny, 6);
          world.markUpdated(nx, ny);
        }
      }
      // 外圈（距离<=5）：概率变火
      else if (dist <= 5 && Math.random() < 0.5) {
        if (nid === 0 || nid === 19) {
          world.set(nx, ny, 6);
          world.markUpdated(nx, ny);
        }
      }

      // 链式引爆其他氢气
      if (nid === 19 && dist > 0) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }
    }
  }
}

registerMaterial(Hydrogen);
