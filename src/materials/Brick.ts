import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 粘土砖 —— 烧制的建筑材料
 * - 固体，不可移动，密度高
 * - 由黏土(21)在高温下烧制而成
 * - 耐火耐酸，非常坚固
 * - 极高温(>500)下会碎裂为沙子(1)
 * - 酸液(9)极缓慢腐蚀
 * - 水(2)长期浸泡后变为湿水泥(35)
 * - 视觉上呈红棕色砖块纹理
 */

export const Brick: MaterialDef = {
  id: 106,
  name: '粘土砖',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.45) {
      // 红砖色
      r = 165 + Math.floor(Math.random() * 30);
      g = 60 + Math.floor(Math.random() * 25);
      b = 40 + Math.floor(Math.random() * 20);
    } else if (t < 0.75) {
      // 深红棕
      r = 140 + Math.floor(Math.random() * 25);
      g = 50 + Math.floor(Math.random() * 20);
      b = 35 + Math.floor(Math.random() * 15);
    } else if (t < 0.92) {
      // 砖缝灰色
      r = 130 + Math.floor(Math.random() * 20);
      g = 120 + Math.floor(Math.random() * 20);
      b = 110 + Math.floor(Math.random() * 15);
    } else {
      // 暗色斑点
      r = 110 + Math.floor(Math.random() * 20);
      g = 40 + Math.floor(Math.random() * 15);
      b = 25 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温碎裂为沙子
    if (temp > 500) {
      world.set(x, y, 1); // 沙子
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液极缓慢腐蚀
      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 熔岩接触加热
      if (nid === 11) {
        world.addTemp(x, y, 8);
      }

      // 火接触加热
      if (nid === 6) {
        world.addTemp(x, y, 3);
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.05) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Brick);
