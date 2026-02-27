import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 角闪石片岩(变质) —— 角闪石为主的变质片岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1150° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 深黑绿色带片状纹理
 */

export const MetaAmphiboliteSchist: MaterialDef = {
  id: 609,
  name: '变质角闪片岩',
  category: '固体',
  description: '以角闪石为主要矿物的变质片岩，常见于中级变质带',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 45 + Math.floor(Math.random() * 12);
      g = 62 + Math.floor(Math.random() * 12);
      b = 52 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 58 + Math.floor(Math.random() * 10);
      g = 78 + Math.floor(Math.random() * 10);
      b = 65 + Math.floor(Math.random() * 10);
    } else {
      r = 35 + Math.floor(Math.random() * 10);
      g = 50 + Math.floor(Math.random() * 10);
      b = 42 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1150) {
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

registerMaterial(MetaAmphiboliteSchist);
