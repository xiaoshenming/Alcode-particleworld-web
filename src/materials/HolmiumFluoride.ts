import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氟化钬 —— 稀土氟化物
 * - 粉末/固体，密度 5.9
 * - 遇水(2)缓慢溶解
 * - 遇酸(9)反应生成烟(7)
 * - 淡粉黄色粉末
 */

export const HolmiumFluoride: MaterialDef = {
  id: 573,
  name: '氟化钬',
  category: '粉末',
  description: '稀土氟化物，用于光纤放大器和磁致伸缩材料',
  density: 5.9,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 248 + Math.floor(Math.random() * 7);
      g = 235 + Math.floor(Math.random() * 10);
      b = 225 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 235 + Math.floor(Math.random() * 12);
      g = 222 + Math.floor(Math.random() * 12);
      b = 212 + Math.floor(Math.random() * 12);
    } else {
      r = 252 + Math.floor(Math.random() * 3);
      g = 245 + Math.floor(Math.random() * 7);
      b = 238 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const below = world.get(x, y + 1);
    if (world.inBounds(x, y + 1)) {
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 5.9 && belowDensity !== Infinity && Math.random() < 0.5) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
        {
      const d = dir;
      const nx = x + d, ny = y + 1;
      if (world.inBounds(nx, ny) && world.get(nx, ny) === 0 && world.get(x, y + 1) !== 0) {
        world.swap(x, y, nx, ny);
        world.wakeArea(nx, ny);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d, ny = y + 1;
      if (world.inBounds(nx, ny) && world.get(nx, ny) === 0 && world.get(x, y + 1) !== 0) {
        world.swap(x, y, nx, ny);
        world.wakeArea(nx, ny);
        return;
      }
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 2 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 7);
        world.set(nx, ny, 0);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(HolmiumFluoride);
