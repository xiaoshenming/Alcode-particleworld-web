import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌金合金 —— 贵金属高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1850° → 液态铌金(542)
 * - 耐酸腐蚀
 * - 金黄色带银灰金属光泽
 */

export const NiobiumGoldAlloy: MaterialDef = {
  id: 541,
  name: '铌金合金',
  category: '金属',
  description: '贵金属高温合金，用于珠宝和高温电子元件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 205 + Math.floor(Math.random() * 12);
      g = 178 + Math.floor(Math.random() * 10);
      b = 95 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 222 + Math.floor(Math.random() * 14);
      g = 195 + Math.floor(Math.random() * 12);
      b = 112 + Math.floor(Math.random() * 10);
    } else {
      r = 185 + Math.floor(Math.random() * 10);
      g = 158 + Math.floor(Math.random() * 10);
      b = 78 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1850) {
      world.set(x, y, 542);
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

registerMaterial(NiobiumGoldAlloy);
