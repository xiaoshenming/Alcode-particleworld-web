import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 石棉 —— 纤维状硅酸盐矿物
 * - 固体，中等密度，不可移动
 * - 极耐高温：>2500°才分解
 * - 隔热：大幅减缓邻居间热传导
 * - 遇水(2)不受影响
 * - 遇酸(9)缓慢腐蚀
 * - 视觉上呈灰白色纤维状
 */

export const Asbestos: MaterialDef = {
  id: 151,
  name: '石棉',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      r = 195 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 15);
      b = 195 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      r = 180 + Math.floor(Math.random() * 15);
      g = 185 + Math.floor(Math.random() * 15);
      b = 180 + Math.floor(Math.random() * 15);
    } else {
      // 微绿
      r = 185 + Math.floor(Math.random() * 10);
      g = 195 + Math.floor(Math.random() * 15);
      b = 185 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温分解
    if (temp > 2500 && Math.random() < 0.005) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸腐蚀
      if (nid === 9 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 隔热：吸收邻居热量但不传递
      if (temp > 30 && Math.random() < 0.02) {
        world.addTemp(x, y, -1);
      }
    }
  },
};

registerMaterial(Asbestos);
