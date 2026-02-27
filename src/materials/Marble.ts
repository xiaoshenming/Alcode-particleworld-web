import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 大理石 —— 变质石灰�ite
 * - 固体，密度 Infinity（不可移动）
 * - 遇酸(9)缓慢溶解并产生气泡（CO2 → 空气）
 * - 高温(>900°)分解为石灰(124)
 * - 耐水、耐风化
 * - 白色带灰色纹理
 */

export const Marble: MaterialDef = {
  id: 239,
  name: '大理石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 白色
      const base = 225 + Math.floor(Math.random() * 20);
      r = base;
      g = base - 2;
      b = base - 5;
    } else if (phase < 0.75) {
      // 灰色纹理
      const base = 180 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.9) {
      // 淡粉纹理
      r = 220 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 15);
      b = 205 + Math.floor(Math.random() * 15);
    } else {
      // 深灰纹路
      const base = 150 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 1;
      b = base + 3;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解为石灰
    if (temp > 900) {
      world.set(x, y, 124); // 石灰
      world.setTemp(x, y, temp * 0.6);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸溶解
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.025) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 产生气泡/烟
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 遇氟化氢快速腐蚀
      if (nid === 208 && Math.random() < 0.05) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Marble);
