import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氟化锶 —— 碱土金属氟化物晶体
 * - 粉末/固体，密度 4.2
 * - 遇水(2)缓慢溶解
 * - 遇酸(9)反应生成烟(7)
 * - 乳白色带淡蓝荧光
 */

export const StrontiumFluoride: MaterialDef = {
  id: 503,
  name: '氟化锶',
  category: '粉末',
  description: '碱土金属氟化物晶体，用于光学窗口和荧光材料',
  density: 4.2,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 225 + Math.floor(Math.random() * 15);
      g = 228 + Math.floor(Math.random() * 12);
      b = 240 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 210 + Math.floor(Math.random() * 12);
      g = 218 + Math.floor(Math.random() * 10);
      b = 235 + Math.floor(Math.random() * 15);
    } else {
      r = 235 + Math.floor(Math.random() * 10);
      g = 238 + Math.floor(Math.random() * 10);
      b = 248 + Math.floor(Math.random() * 7);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    // 粉末下落
    const below = world.get(x, y + 1);
    if (world.inBounds(x, y + 1)) {
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 4.2 && belowDensity !== Infinity && Math.random() < 0.5) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
    }

    // 斜向滑落
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

    // 化学反应
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水缓慢溶解
      if (nid === 2 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 遇酸反应
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 7);
        world.set(nx, ny, 0);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(StrontiumFluoride);
