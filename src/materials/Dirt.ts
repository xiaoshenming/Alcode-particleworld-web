import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 泥土 —— 粉末类，受重力影响
 * - 遇水变成黏土（ID 21）
 * - 比沙子稍重，堆积行为类似
 */

function canDisplace(x: number, y: number, myDensity: number, world: WorldAPI): boolean {
  if (world.isEmpty(x, y)) return true;
  return world.getDensity(x, y) < myDensity;
}

export const Dirt: MaterialDef = {
  id: 20,
  name: '泥土',
  color() {
    const r = 120 + Math.floor(Math.random() * 20);
    const g = 72 + Math.floor(Math.random() * 15);
    const b = 40 + Math.floor(Math.random() * 10);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 棕色
  },
  density: 3.5,
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居：遇水变黏土
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 2 && Math.random() < 0.08) {
        world.set(x, y, 21); // 变黏土
        world.set(nx, ny, 0); // 水被吸收
        return;
      }
    }

    if (y >= world.height - 1) return;

    // 重力下落
    if (canDisplace(x, y + 1, Dirt.density, world)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下滑落
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, Dirt.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(Dirt);
