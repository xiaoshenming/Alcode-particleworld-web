import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 页岩 —— 沉积岩
 * - 固体，密度 Infinity（不可移动）
 * - 层状结构：颜色有明显的水平纹理
 * - 中等硬度：酸可缓慢腐蚀
 * - 高温(>900°)分解为泥土(20)
 * - 含油页岩(122)加热可提取油
 * - 深灰色带褐色层纹
 */

export const Shale: MaterialDef = {
  id: 259,
  name: '页岩',
  category: '矿石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰
      const base = 75 + Math.floor(Math.random() * 20);
      r = base + 5;
      g = base;
      b = base - 3;
    } else if (phase < 0.7) {
      // 褐灰层纹
      r = 95 + Math.floor(Math.random() * 20);
      g = 80 + Math.floor(Math.random() * 15);
      b = 65 + Math.floor(Math.random() * 15);
    } else {
      // 暗灰
      const base = 60 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 2;
      b = base + 5;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解为泥土
    if (temp > 900) {
      world.set(x, y, 20); // 泥土
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸腐蚀更快
      if ((nid === 173 || nid === 183) && Math.random() < 0.04) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 低导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Shale);
