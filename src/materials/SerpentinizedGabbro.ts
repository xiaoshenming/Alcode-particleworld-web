import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蛇纹岩化辉长岩 —— 变质侵入岩
 * - 固体，密度 Infinity（不可移动）
 * - 极耐高温（>2600° 才熔化为熔岩）
 * - 耐酸性好
 * - 深绿灰色，带蛇纹石脉络
 */

export const SerpentinizedGabbro: MaterialDef = {
  id: 444,
  name: '蛇纹岩化辉长岩',
  category: '固体',
  description: '辉长岩经蛇纹石化变质形成，深绿灰色带脉络纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深灰绿基底
      r = 45 + Math.floor(Math.random() * 12);
      g = 58 + Math.floor(Math.random() * 15);
      b = 45 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 蛇纹石绿色脉络
      r = 55 + Math.floor(Math.random() * 15);
      g = 80 + Math.floor(Math.random() * 20);
      b = 55 + Math.floor(Math.random() * 12);
    } else {
      // 暗色矿物斑点
      r = 35 + Math.floor(Math.random() * 10);
      g = 40 + Math.floor(Math.random() * 10);
      b = 38 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2600) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
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

registerMaterial(SerpentinizedGabbro);
