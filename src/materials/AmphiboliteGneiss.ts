import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 角闪片麻岩 —— 富含角闪石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 高温 >1850° 熔化为熔岩
 * - 耐酸性中等
 * - 深灰绿色，片麻状条带纹理
 */

export const AmphiboliteGneiss: MaterialDef = {
  id: 499,
  name: '角闪片麻岩',
  category: '固体',
  description: '富含角闪石的片麻岩，深灰绿色条带状构造',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 52 + Math.floor(Math.random() * 12);
      g = 58 + Math.floor(Math.random() * 12);
      b = 50 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 65 + Math.floor(Math.random() * 12);
      g = 72 + Math.floor(Math.random() * 12);
      b = 62 + Math.floor(Math.random() * 10);
    } else {
      r = 40 + Math.floor(Math.random() * 8);
      g = 45 + Math.floor(Math.random() * 8);
      b = 38 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1850) {
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

      if (nid === 9 && Math.random() < 0.006) {
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

registerMaterial(AmphiboliteGneiss);
