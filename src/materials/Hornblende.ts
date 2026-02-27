import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 角闪石 —— 常见造岩矿物
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>1800° → 熔岩(11)
 * - 耐酸(9)
 * - 深绿至黑色，带柱状纹理
 */

export const Hornblende: MaterialDef = {
  id: 374,
  name: '角闪石',
  category: '矿石',
  description: '常见造岩矿物，深绿至黑色柱状晶体，广泛分布于火成岩和变质岩中',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深绿
      r = 35 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 18);
      b = 30 + Math.floor(Math.random() * 12);
    } else if (phase < 0.7) {
      // 暗黑绿
      r = 25 + Math.floor(Math.random() * 12);
      g = 40 + Math.floor(Math.random() * 15);
      b = 22 + Math.floor(Math.random() * 10);
    } else if (phase < 0.9) {
      // 灰绿
      r = 50 + Math.floor(Math.random() * 12);
      g = 65 + Math.floor(Math.random() * 12);
      b = 45 + Math.floor(Math.random() * 10);
    } else {
      // 亮绿高光
      r = 60 + Math.floor(Math.random() * 18);
      g = 80 + Math.floor(Math.random() * 18);
      b = 50 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 1800) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸
      if (nid === 9 && Math.random() < 0.004) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Hornblende);
