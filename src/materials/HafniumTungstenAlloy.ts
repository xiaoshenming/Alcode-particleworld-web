import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铪钨合金 —— 超高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点 >3400° → 液态铪钨(447)
 * - 极耐酸腐蚀
 * - 银灰色带暗色纹理
 */

export const HafniumTungstenAlloy: MaterialDef = {
  id: 446,
  name: '铪钨合金',
  category: '金属',
  description: '超高温合金，极高熔点，用于航天发动机和核反应堆',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 160 + Math.floor(Math.random() * 15);
      g = 162 + Math.floor(Math.random() * 12);
      b = 170 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 140 + Math.floor(Math.random() * 12);
      g = 145 + Math.floor(Math.random() * 10);
      b = 155 + Math.floor(Math.random() * 12);
    } else {
      r = 180 + Math.floor(Math.random() * 15);
      g = 182 + Math.floor(Math.random() * 10);
      b = 190 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 3400) {
      world.set(x, y, 447);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐酸
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热（金属导热好）
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.09;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(HafniumTungstenAlloy);
