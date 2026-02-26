import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铟 —— 柔软低熔点金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>157° → 液态铟(432)
 * - 极其柔软，可被酸腐蚀（概率0.008）
 * - 银白色带微蓝光泽
 */

export const Indium: MaterialDef = {
  id: 431,
  name: '铟',
  category: '金属',
  description: '柔软低熔点金属，银白色，用于触摸屏和焊料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 195 + Math.floor(Math.random() * 15);
      g = 198 + Math.floor(Math.random() * 12);
      b = 215 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 180 + Math.floor(Math.random() * 12);
      g = 185 + Math.floor(Math.random() * 10);
      b = 205 + Math.floor(Math.random() * 12);
    } else {
      r = 210 + Math.floor(Math.random() * 12);
      g = 215 + Math.floor(Math.random() * 10);
      b = 230 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 157) {
      world.set(x, y, 432);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.09) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.11;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Indium);
