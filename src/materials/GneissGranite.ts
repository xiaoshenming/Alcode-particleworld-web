import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 片麻花岗岩 —— 变质花岗岩，具有片麻状构造
 * - 固体，密度 Infinity（不可移动）
 * - 极耐高温（>2000° 才熔化为熔岩(11)）
 * - 耐酸(9)强
 * - 粉灰色带条纹状纹理
 */

export const GneissGranite: MaterialDef = {
  id: 354,
  name: '片麻花岗岩',
  category: '矿石',
  description: '变质花岗岩，具有片麻状条纹构造',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.3) {
      // 浅粉灰（长石条带）
      r = 185 + Math.floor(Math.random() * 20);
      g = 170 + Math.floor(Math.random() * 15);
      b = 165 + Math.floor(Math.random() * 12);
    } else if (phase < 0.55) {
      // 深灰（暗色矿物条带）
      r = 100 + Math.floor(Math.random() * 20);
      g = 98 + Math.floor(Math.random() * 18);
      b = 95 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 中灰（石英）
      r = 150 + Math.floor(Math.random() * 18);
      g = 148 + Math.floor(Math.random() * 16);
      b = 145 + Math.floor(Math.random() * 14);
    } else {
      // 白色条纹
      r = 200 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 18);
      b = 190 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 2000) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸强
      if (nid === 9 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(GneissGranite);
