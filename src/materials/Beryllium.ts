import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铍 —— 轻质高强度金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1287° → 液态铍(422)
 * - 极轻但坚硬，耐酸较好（概率0.003）
 * - 良好导热
 * - 浅灰色带银白光泽
 */

export const Beryllium: MaterialDef = {
  id: 421,
  name: '铍',
  category: '金属',
  description: '轻质高强度金属，密度极低但硬度高，用于航天合金',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 195 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 12);
      b = 205 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 175 + Math.floor(Math.random() * 12);
      g = 180 + Math.floor(Math.random() * 10);
      b = 185 + Math.floor(Math.random() * 10);
    } else {
      r = 218 + Math.floor(Math.random() * 12);
      g = 222 + Math.floor(Math.random() * 10);
      b = 228 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1287) {
      world.set(x, y, 422);
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

      if (nid !== 0 && Math.random() < 0.09) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.12;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Beryllium);
