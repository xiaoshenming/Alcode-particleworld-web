import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽银合金 —— 高导电耐蚀贵金属合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2300° → 液态钽银(722)
 * - 极耐酸腐蚀
 * - 银白色带亮银光泽金属
 */

export const TantalumSilverAlloy: MaterialDef = {
  id: 721,
  name: '钽银合金',
  category: '金属',
  description: '高导电耐蚀贵金属合金，用于高端电接触和医疗器械',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 195 + Math.floor(Math.random() * 12);
      g = 200 + Math.floor(Math.random() * 10);
      b = 205 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 210 + Math.floor(Math.random() * 14);
      g = 215 + Math.floor(Math.random() * 12);
      b = 220 + Math.floor(Math.random() * 10);
    } else {
      r = 182 + Math.floor(Math.random() * 10);
      g = 188 + Math.floor(Math.random() * 10);
      b = 192 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2300) {
      world.set(x, y, 722);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0002) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

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

registerMaterial(TantalumSilverAlloy);
