import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 片麻岩 —— 变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 层状条纹结构：明暗交替的带状纹理
 * - 高硬度：酸腐蚀极慢
 * - 极高温(>1200°)熔化为熔岩
 * - 灰白色与深灰色交替条纹
 */

export const Gneiss: MaterialDef = {
  id: 264,
  name: '片麻岩',
  category: '矿石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 浅灰白条纹
      const base = 170 + Math.floor(Math.random() * 25);
      r = base + 5;
      g = base;
      b = base - 5;
    } else if (phase < 0.65) {
      // 深灰条纹
      const base = 80 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.85) {
      // 中灰
      const base = 120 + Math.floor(Math.random() * 20);
      r = base + 3;
      g = base;
      b = base - 2;
    } else {
      // 偶尔带粉色（长石）
      r = 160 + Math.floor(Math.random() * 25);
      g = 130 + Math.floor(Math.random() * 15);
      b = 125 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 1200) {
      world.set(x, y, 11); // 熔岩
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

      // 酸腐蚀极慢
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸稍快
      if ((nid === 173 || nid === 183) && Math.random() < 0.015) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 低导热
      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Gneiss);
