import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 角闪片岩 —— 中级变质岩（片状构造）
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >2500° 熔化为熔岩
 * - 耐酸性中等
 * - 深绿黑色带片状纹理，与角闪岩(279)不同的是具有明显片理
 */

export const AmphiboliteSchist: MaterialDef = {
  id: 454,
  name: '角闪片岩',
  category: '固体',
  description: '角闪石为主的中级变质岩，深绿黑色片状构造，具有明显片理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 30 + Math.floor(Math.random() * 12);
      g = 42 + Math.floor(Math.random() * 15);
      b = 35 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 40 + Math.floor(Math.random() * 15);
      g = 60 + Math.floor(Math.random() * 18);
      b = 45 + Math.floor(Math.random() * 12);
    } else {
      r = 25 + Math.floor(Math.random() * 10);
      g = 28 + Math.floor(Math.random() * 10);
      b = 30 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2500) {
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

      if (nid === 9 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

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

registerMaterial(AmphiboliteSchist);
