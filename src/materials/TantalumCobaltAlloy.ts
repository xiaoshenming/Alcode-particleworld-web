import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽钴合金 —— 高温磁性合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2620° → 液态钽钴(692)
 * - 极耐酸腐蚀
 * - 银灰色带暗钴蓝调金属光泽
 */

export const TantalumCobaltAlloy: MaterialDef = {
  id: 691,
  name: '钽钴合金',
  category: '金属',
  description: '高温磁性合金，用于永磁体和高温结构件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 12);
      g = 158 + Math.floor(Math.random() * 10);
      b = 172 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 168 + Math.floor(Math.random() * 14);
      g = 172 + Math.floor(Math.random() * 12);
      b = 188 + Math.floor(Math.random() * 10);
    } else {
      r = 142 + Math.floor(Math.random() * 10);
      g = 145 + Math.floor(Math.random() * 10);
      b = 160 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2620) {
      world.set(x, y, 692);
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

      if (nid !== 0 && Math.random() < 0.07) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(TantalumCobaltAlloy);
