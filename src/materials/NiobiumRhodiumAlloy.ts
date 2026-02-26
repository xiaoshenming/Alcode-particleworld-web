import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌铑合金 —— 超耐腐蚀贵金属合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2150° → 液态铌铑(557)
 * - 极耐酸腐蚀
 * - 银白色带亮灰金属光泽
 */

export const NiobiumRhodiumAlloy: MaterialDef = {
  id: 556,
  name: '铌铑合金',
  category: '金属',
  description: '超耐腐蚀贵金属合金，用于催化转化器和高温电极',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 192 + Math.floor(Math.random() * 12);
      g = 198 + Math.floor(Math.random() * 10);
      b = 208 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 212 + Math.floor(Math.random() * 14);
      g = 218 + Math.floor(Math.random() * 12);
      b = 228 + Math.floor(Math.random() * 10);
    } else {
      r = 172 + Math.floor(Math.random() * 10);
      g = 178 + Math.floor(Math.random() * 10);
      b = 190 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2150) {
      world.set(x, y, 557);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0003) {
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

registerMaterial(NiobiumRhodiumAlloy);
