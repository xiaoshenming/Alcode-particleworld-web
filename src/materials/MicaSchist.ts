import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 云母片岩 —— 富含云母的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高熔点：>1200° → 熔岩(11)
 * - 耐酸(9)
 * - 银灰色带闪亮片状纹理
 */

export const MicaSchist: MaterialDef = {
  id: 339,
  name: '云母片岩',
  category: '矿石',
  description: '富含云母的变质岩，具有片状结构',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 银灰
      const base = 140 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.6) {
      // 暗灰褐
      r = 110 + Math.floor(Math.random() * 15);
      g = 105 + Math.floor(Math.random() * 12);
      b = 95 + Math.floor(Math.random() * 12);
    } else if (phase < 0.85) {
      // 云母闪光（亮银）
      const base = 180 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 3;
      b = base + 8;
    } else {
      // 金色云母闪光
      r = 190 + Math.floor(Math.random() * 25);
      g = 175 + Math.floor(Math.random() * 20);
      b = 130 + Math.floor(Math.random() * 15);
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

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(MicaSchist);
