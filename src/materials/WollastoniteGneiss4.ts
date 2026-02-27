import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 硅灰石片麻岩(4) —— 硅灰石与片麻岩的变质岩
 * - 固体，密度 Infinity
 * - 灰白微黄色调
 */

export const WollastoniteGneiss4: MaterialDef = {
  id: 1184,
  name: '硅灰石片麻岩(4)',
  category: '固体',
  description: '硅灰石与片麻岩的高级变质岩，具有针状晶体纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 182 + Math.floor(Math.random() * 22);
      g = 178 + Math.floor(Math.random() * 22);
      b = 166 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 192 + Math.floor(Math.random() * 12);
      g = 188 + Math.floor(Math.random() * 12);
      b = 176 + Math.floor(Math.random() * 12);
    } else {
      r = 176 + Math.floor(Math.random() * 10);
      g = 172 + Math.floor(Math.random() * 10);
      b = 160 + Math.floor(Math.random() * 10);
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

registerMaterial(WollastoniteGneiss4);
