import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 镥 —— 最重的稀土金属，银白色
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1663° → 液态镥(402)
 * - 极耐腐蚀（酸概率0.003）
 * - 良好导热
 * - 银白色带蓝色光泽
 */

export const Lutetium: MaterialDef = {
  id: 401,
  name: '镥',
  category: '金属',
  description: '最重的稀土金属，银白色带蓝色光泽，极耐腐蚀',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白带蓝
      r = 200 + Math.floor(Math.random() * 15);
      g = 205 + Math.floor(Math.random() * 12);
      b = 218 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗银蓝
      r = 180 + Math.floor(Math.random() * 12);
      g = 185 + Math.floor(Math.random() * 10);
      b = 200 + Math.floor(Math.random() * 12);
    } else {
      // 亮银高光
      r = 225 + Math.floor(Math.random() * 15);
      g = 228 + Math.floor(Math.random() * 12);
      b = 240 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1663) {
      world.set(x, y, 402); // 液态镥
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
      if (nid === 9 && Math.random() < 0.003) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 良好导热
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.14;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Lutetium);
