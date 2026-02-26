import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 辉绿片岩 —— 辉绿岩变质形成的片岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1200° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 深绿灰色带片状纹理
 */

export const DiabaseSchist: MaterialDef = {
  id: 604,
  name: '辉绿片岩',
  category: '固体',
  description: '辉绿岩经区域变质形成的片岩，具有良好的建筑装饰性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 62 + Math.floor(Math.random() * 12);
      g = 82 + Math.floor(Math.random() * 12);
      b = 72 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 75 + Math.floor(Math.random() * 10);
      g = 98 + Math.floor(Math.random() * 10);
      b = 85 + Math.floor(Math.random() * 10);
    } else {
      r = 52 + Math.floor(Math.random() * 10);
      g = 68 + Math.floor(Math.random() * 10);
      b = 60 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

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

      if (nid === 9 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.06) {
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

registerMaterial(DiabaseSchist);
