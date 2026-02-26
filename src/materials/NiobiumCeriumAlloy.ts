import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌铈合金 —— 稀土增强耐热合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2100° → 液态铌铈(587)
 * - 较耐酸腐蚀
 * - 深灰色带暖调金属光泽
 */

export const NiobiumCeriumAlloy: MaterialDef = {
  id: 586,
  name: '铌铈合金',
  category: '金属',
  description: '稀土增强耐热合金，用于催化剂载体和高温结构件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 152 + Math.floor(Math.random() * 12);
      g = 148 + Math.floor(Math.random() * 10);
      b = 142 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 172 + Math.floor(Math.random() * 14);
      g = 168 + Math.floor(Math.random() * 12);
      b = 158 + Math.floor(Math.random() * 10);
    } else {
      r = 135 + Math.floor(Math.random() * 10);
      g = 132 + Math.floor(Math.random() * 10);
      b = 125 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2100) {
      world.set(x, y, 587);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0004) {
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

registerMaterial(NiobiumCeriumAlloy);
