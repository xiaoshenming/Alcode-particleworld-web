import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 三氟化铁 —— 腐蚀性粉末/固体
 * - 粉末，密度 1.5（受重力下落）
 * - 接触水溶解为酸液(9)
 * - 接触金属(10)缓慢腐蚀为铁锈(72)
 * - 高温 >300° 升华为毒气(18)
 * - 黄绿色粉末
 */

export const IronTrifluoride: MaterialDef = {
  id: 418,
  name: '三氟化铁',
  category: '化学',
  description: '腐蚀性黄绿色粉末，遇水生成酸液，可腐蚀金属',
  density: 1.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 黄绿色
      r = 180 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 15);
      b = 80 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗黄绿
      r = 155 + Math.floor(Math.random() * 15);
      g = 170 + Math.floor(Math.random() * 12);
      b = 65 + Math.floor(Math.random() * 15);
    } else {
      // 亮黄
      r = 205 + Math.floor(Math.random() * 15);
      g = 210 + Math.floor(Math.random() * 12);
      b = 95 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温升华为毒气
    if (temp > 300) {
      world.set(x, y, 18);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水溶解为酸液
      if (nid === 2 && Math.random() < 0.1) {
        world.set(x, y, 9); // 酸液
        world.wakeArea(x, y);
        return;
      }

      // 腐蚀金属
      if (nid === 10 && Math.random() < 0.02) {
        world.set(nx, ny, 72); // 铁锈
        world.set(x, y, 0);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // === 粉末运动（受重力下落） ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 1.5) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下滑落
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

registerMaterial(IronTrifluoride);
