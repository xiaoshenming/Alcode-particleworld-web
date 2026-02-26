import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铼铒合金 —— 铼与铒的高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >4500° → 液态铼铒(1057)
 * - 耐酸腐蚀
 * - 银灰偏粉色调光泽
 */

export const RheniumErbiumAlloy: MaterialDef = {
  id: 1056,
  name: '铼铒合金',
  category: '固体',
  description: '铼与铒的合金，结合铼的超高熔点与铒的光学特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 180 + Math.floor(Math.random() * 20);
      g = 172 + Math.floor(Math.random() * 18);
      b = 182 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 190 + Math.floor(Math.random() * 10);
      g = 182 + Math.floor(Math.random() * 10);
      b = 192 + Math.floor(Math.random() * 10);
    } else {
      r = 180 + Math.floor(Math.random() * 8);
      g = 172 + Math.floor(Math.random() * 8);
      b = 182 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 4500) {
      world.set(x, y, 1057);
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

registerMaterial(RheniumErbiumAlloy);
