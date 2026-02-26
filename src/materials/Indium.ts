import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铟 —— 柔软的稀有金属，低熔点
 * - 固体，密度 Infinity（不可移动）
 * - 低熔点：>157° → 液态铟(317)
 * - 极软：接触酸(9)较快溶解
 * - 中等导热(0.06)
 * - 银白色带微蓝调
 */

export const Indium: MaterialDef = {
  id: 316,
  name: '铟',
  category: '金属',
  description: '柔软的稀有金属，低熔点',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白
      const base = 175 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 3;
      b = base + 10;
    } else if (phase < 0.8) {
      // 微蓝灰
      const base = 150 + Math.floor(Math.random() * 15);
      r = base - 5;
      g = base;
      b = base + 12;
    } else {
      // 高光
      const base = 200 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 8;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低熔点
    if (temp > 157) {
      world.set(x, y, 317);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸溶解（较快）
      if (nid === 9 && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.06) {
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

registerMaterial(Indium);
