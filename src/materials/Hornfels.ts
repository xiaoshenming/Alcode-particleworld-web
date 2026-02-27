import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 角岩 —— 接触变质岩，质地致密坚硬
 * - 固体，密度 Infinity（不可移动）
 * - 极高温(>1300°)熔化为熔岩
 * - 酸腐蚀极慢，强酸稍快
 * - 低导热
 * - 深灰到黑灰色，偶尔带暗绿或暗紫斑点
 */

export const Hornfels: MaterialDef = {
  id: 294,
  name: '角岩',
  category: '矿石',
  description: '接触变质岩，质地致密坚硬',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.45) {
      // 深灰
      const base = 50 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 4;
    } else if (phase < 0.75) {
      // 黑灰
      const base = 35 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 1;
      b = base + 3;
    } else if (phase < 0.88) {
      // 暗绿斑点
      const base = 40 + Math.floor(Math.random() * 15);
      r = base - 5;
      g = base + 10;
      b = base;
    } else {
      // 暗紫斑点
      const base = 42 + Math.floor(Math.random() * 15);
      r = base + 8;
      g = base - 5;
      b = base + 12;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化为熔岩
    if (temp > 1300) {
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

      // 普通酸腐蚀极慢
      if (nid === 9 && Math.random() < 0.006) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸（硫酸173/硝酸183）腐蚀稍快
      if ((nid === 173 || nid === 183) && Math.random() < 0.012) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 低导热：与邻居温差>10时缓慢传导
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

registerMaterial(Hornfels);
