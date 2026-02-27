import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 红柱石片麻岩(5) —— 红柱石与片麻岩的变质岩
 * - 固体，密度 Infinity
 * - 深红褐色调
 */

export const AndalusiteGneiss5: MaterialDef = {
  id: 1129,
  name: '红柱石片麻岩(5)',
  category: '固体',
  description: '红柱石与片麻岩的高级变质岩，具有柱状晶体纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 148 + Math.floor(Math.random() * 22);
      g = 105 + Math.floor(Math.random() * 20);
      b = 95 + Math.floor(Math.random() * 18);
    } else if (phase < 0.8) {
      r = 158 + Math.floor(Math.random() * 12);
      g = 112 + Math.floor(Math.random() * 12);
      b = 102 + Math.floor(Math.random() * 12);
    } else {
      r = 140 + Math.floor(Math.random() * 10);
      g = 98 + Math.floor(Math.random() * 10);
      b = 88 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 11 && Math.random() < 0.0008) {
        world.set(x, y, 11);
        world.wakeArea(x, y);
        return;
      }
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(AndalusiteGneiss5);
