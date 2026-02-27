import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钌 —— 铂族金属，银白色，极硬极脆
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>2334° → 液态钌(407)
 * - 极耐腐蚀（几乎不被酸腐蚀）
 * - 良好导热
 * - 银白色带暗色光泽
 */

export const Ruthenium: MaterialDef = {
  id: 406,
  name: '钌',
  category: '金属',
  description: '铂族金属，银白色，极硬极脆，用于电子触点和催化剂',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白偏暗
      r = 188 + Math.floor(Math.random() * 15);
      g = 192 + Math.floor(Math.random() * 12);
      b = 195 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗银
      r = 160 + Math.floor(Math.random() * 12);
      g = 164 + Math.floor(Math.random() * 10);
      b = 168 + Math.floor(Math.random() * 10);
    } else {
      // 亮银高光
      r = 215 + Math.floor(Math.random() * 15);
      g = 218 + Math.floor(Math.random() * 12);
      b = 222 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 2334) {
      world.set(x, y, 407); // 液态钌
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐酸
      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 良好导热
      if (nid !== 0 && Math.random() < 0.09) {
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

registerMaterial(Ruthenium);
