import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌锰合金 —— 高强度耐热合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1900° → 液态铌锰(532)
 * - 耐酸腐蚀
 * - 深灰色带锰紫金属光泽
 */

export const NiobiumManganeseAlloy: MaterialDef = {
  id: 531,
  name: '铌锰合金',
  category: '金属',
  description: '高强度耐热合金，用于特种钢添加剂和耐磨部件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 125 + Math.floor(Math.random() * 12);
      g = 118 + Math.floor(Math.random() * 10);
      b = 132 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 145 + Math.floor(Math.random() * 14);
      g = 138 + Math.floor(Math.random() * 12);
      b = 155 + Math.floor(Math.random() * 10);
    } else {
      r = 108 + Math.floor(Math.random() * 10);
      g = 102 + Math.floor(Math.random() * 10);
      b = 115 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1900) {
      world.set(x, y, 532);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.001) {
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

registerMaterial(NiobiumManganeseAlloy);
