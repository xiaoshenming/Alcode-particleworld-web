import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 尖晶石片麻岩(4) —— 尖晶石与片麻岩的变质岩
 * - 固体，密度 Infinity
 * - 深灰偏绿色调
 */

export const SpinelGneiss4: MaterialDef = {
  id: 1109,
  name: '尖晶石片麻岩(4)',
  category: '固体',
  description: '尖晶石与片麻岩的高级变质岩，具有八面体晶粒纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 135 + Math.floor(Math.random() * 22);
      g = 145 + Math.floor(Math.random() * 22);
      b = 130 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 145 + Math.floor(Math.random() * 12);
      g = 155 + Math.floor(Math.random() * 12);
      b = 140 + Math.floor(Math.random() * 12);
    } else {
      r = 128 + Math.floor(Math.random() * 10);
      g = 138 + Math.floor(Math.random() * 10);
      b = 125 + Math.floor(Math.random() * 10);
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

registerMaterial(SpinelGneiss4);
