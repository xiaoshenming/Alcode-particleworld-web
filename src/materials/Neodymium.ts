import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钕 —— 稀土金属，银白色带淡紫色调
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1024° → 液态钕(372)
 * - 磁性：吸引附近金属粒子（铁169、镍216等）
 * - 耐酸较弱（活泼稀土）
 */

/** 可被磁力吸引的金属 ID */
const MAGNETIC_TARGETS = new Set([10, 85, 169, 216, 231]); // 金属、铜、液态铁、镍、钴

export const Neodymium: MaterialDef = {
  id: 371,
  name: '钕',
  category: '金属',
  description: '稀土金属，强磁性，用于制造钕铁硼永磁体',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白带淡紫
      r = 192 + Math.floor(Math.random() * 15);
      g = 185 + Math.floor(Math.random() * 12);
      b = 200 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗银紫
      r = 170 + Math.floor(Math.random() * 12);
      g = 165 + Math.floor(Math.random() * 10);
      b = 182 + Math.floor(Math.random() * 12);
    } else {
      // 亮银高光
      r = 210 + Math.floor(Math.random() * 18);
      g = 205 + Math.floor(Math.random() * 15);
      b = 218 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1024) {
      world.set(x, y, 372); // 液态钕
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;

    // 磁力吸引：3格范围内的金属粒子向钕移动
    if (Math.random() < 0.1) {
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          const nid = world.get(nx, ny);
          if (MAGNETIC_TARGETS.has(nid)) {
            // 向钕方向移动一格
            const mx = nx + (dx > 0 ? -1 : dx < 0 ? 1 : 0);
            const my = ny + (dy > 0 ? -1 : dy < 0 ? 1 : 0);
            if (world.inBounds(mx, my) && world.isEmpty(mx, my)) {
              world.swap(nx, ny, mx, my);
              world.markUpdated(mx, my);
              world.wakeArea(mx, my);
            }
          }
        }
      }
    }

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸较弱
      if (nid === 9 && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Neodymium);
