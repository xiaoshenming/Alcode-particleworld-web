import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽铪合金 —— 高温耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2950° → 液态钽铪(652)
 * - 极耐酸腐蚀
 * - 深银灰色带蓝调金属光泽
 */

export const TantalumHafniumAlloy: MaterialDef = {
  id: 651,
  name: '钽铪合金',
  category: '金属',
  description: '高温耐蚀合金，用于航空发动机和化工反应器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 168 + Math.floor(Math.random() * 12);
      g = 172 + Math.floor(Math.random() * 10);
      b = 182 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 185 + Math.floor(Math.random() * 14);
      g = 190 + Math.floor(Math.random() * 12);
      b = 200 + Math.floor(Math.random() * 10);
    } else {
      r = 152 + Math.floor(Math.random() * 10);
      g = 158 + Math.floor(Math.random() * 10);
      b = 170 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2950) {
      world.set(x, y, 652);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
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

registerMaterial(TantalumHafniumAlloy);
