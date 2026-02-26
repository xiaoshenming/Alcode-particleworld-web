import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 氟化铵 —— 腐蚀性白色粉末
 * - 粉末，密度 1.3（受重力下落）
 * - 接触水溶解为酸液(9)
 * - 接触玻璃/石头缓慢腐蚀（氟化物蚀刻）
 * - 高温 >230° 分解为毒气(18)
 * - 白色粉末
 */

export const AmmoniumFluoride: MaterialDef = {
  id: 423,
  name: '氟化铵',
  category: '化学',
  description: '腐蚀性白色粉末，可蚀刻玻璃，遇水生成酸液',
  density: 1.3,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 235 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 12);
      b = 230 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 218 + Math.floor(Math.random() * 12);
      g = 218 + Math.floor(Math.random() * 10);
      b = 215 + Math.floor(Math.random() * 10);
    } else {
      r = 245 + Math.floor(Math.random() * 10);
      g = 245 + Math.floor(Math.random() * 8);
      b = 240 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 230) {
      world.set(x, y, 18); // 毒气
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水溶解为酸液
      if (nid === 2 && Math.random() < 0.12) {
        world.set(x, y, 9);
        world.wakeArea(x, y);
        return;
      }

      // 蚀刻玻璃(23)
      if (nid === 23 && Math.random() < 0.02) {
        world.set(nx, ny, 0);
        world.set(x, y, 0);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 腐蚀石头(3)
      if (nid === 3 && Math.random() < 0.008) {
        world.set(nx, ny, 0);
        world.set(x, y, 0);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // === 粉末运动 ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 1.3) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    if (y < world.height - 1 && Math.random() < 0.5) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(AmmoniumFluoride);
