import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 榴辉岩 —— 高压变质岩，由石榴石和辉石组成
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>1200° → 熔岩(11)
 * - 耐酸(9)：缓慢溶解
 * - 中等导热(0.05)
 * - 深绿色带红色石榴石斑点
 */

export const Eclogite: MaterialDef = {
  id: 314,
  name: '榴辉岩',
  category: '矿石',
  description: '高压变质岩，含石榴石和辉石',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 深绿色（辉石基质）
      r = 35 + Math.floor(Math.random() * 20);
      g = 75 + Math.floor(Math.random() * 25);
      b = 40 + Math.floor(Math.random() * 15);
    } else if (phase < 0.85) {
      // 红色斑点（石榴石）
      r = 140 + Math.floor(Math.random() * 40);
      g = 30 + Math.floor(Math.random() * 20);
      b = 35 + Math.floor(Math.random() * 15);
    } else {
      // 暗绿过渡
      r = 50 + Math.floor(Math.random() * 15);
      g = 60 + Math.floor(Math.random() * 20);
      b = 45 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1200) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸但缓慢溶解
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Eclogite);
