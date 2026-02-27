import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 高纯氟化钪镧 —— 混合稀土氟化物
 * - 粉末/固体，密度 7.2
 * - 遇水(2)缓慢溶解
 * - 遇酸(9)反应生成烟(7)
 * - 白色微带淡蓝调粉末
 */

export const HighPurityScandiumLanthanumFluoride: MaterialDef = {
  id: 698,
  name: '高纯氟化钪镧',
  category: '粉末',
  description: '混合稀土氟化物，用于固体氧化物燃料电池和激光晶体',
  density: 7.2,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 242 + Math.floor(Math.random() * 5);
      g = 245 + Math.floor(Math.random() * 8);
      b = 250 + Math.floor(Math.random() * 5);
    } else if (phase < 0.8) {
      r = 235 + Math.floor(Math.random() * 10);
      g = 238 + Math.floor(Math.random() * 10);
      b = 245 + Math.floor(Math.random() * 10);
    } else {
      r = 248;
      g = 250 + Math.floor(Math.random() * 5);
      b = 252;
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
      if (belowDensity < 7.2 && belowDensity !== Infinity && Math.random() < 0.5) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
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

registerMaterial(HighPurityScandiumLanthanumFluoride);
