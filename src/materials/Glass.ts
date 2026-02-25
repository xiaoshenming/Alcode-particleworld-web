import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 玻璃 —— 透明固体，沙子被雷电熔化产生
 * - 不可燃，不受重力
 * - 酸液可腐蚀
 */
export const Glass: MaterialDef = {
  id: 17,
  name: '玻璃',
  color() {
    const r = 180 + Math.floor(Math.random() * 20);
    const g = 220 + Math.floor(Math.random() * 20);
    const b = 240 + Math.floor(Math.random() * 15);
    // 半透明效果用较低 alpha
    return (0xCC << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    // 玻璃是惰性固体，只检查酸液腐蚀
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 9 && Math.random() < 0.02) {
        // 酸液腐蚀玻璃
        world.set(x, y, 0);
        world.set(nx, ny, 0); // 酸液也消耗
        return;
      }
    }
  },
};

registerMaterial(Glass);
