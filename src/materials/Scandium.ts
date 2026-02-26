import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钪 —— 轻质稀土金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1541° → 液态钪(452)
 * - 遇酸缓慢溶解
 * - 银白色带微黄光泽
 */

export const Scandium: MaterialDef = {
  id: 451,
  name: '钪',
  category: '金属',
  description: '轻质稀土金属，银白色，用于航空合金和固体氧化物燃料电池',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 190 + Math.floor(Math.random() * 15);
      g = 192 + Math.floor(Math.random() * 12);
      b = 185 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 205 + Math.floor(Math.random() * 12);
      g = 205 + Math.floor(Math.random() * 10);
      b = 195 + Math.floor(Math.random() * 10);
    } else {
      r = 175 + Math.floor(Math.random() * 12);
      g = 178 + Math.floor(Math.random() * 10);
      b = 170 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1541) {
      world.set(x, y, 452);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.012) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Scandium);
