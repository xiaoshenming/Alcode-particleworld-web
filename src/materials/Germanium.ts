import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 锗 —— 半导体元素，银灰色类金属
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>938° → 液态锗(322)
 * - 半导体特性：接触电线(44)传导信号
 * - 耐酸(9)：缓慢溶解
 * - 中等导热(0.06)
 * - 银灰色带金属光泽
 */

export const Germanium: MaterialDef = {
  id: 321,
  name: '锗',
  category: '金属',
  description: '半导体元素，银灰色类金属',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰基调
      const base = 155 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.8) {
      // 暗灰
      const base = 130 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 1;
      b = base + 3;
    } else {
      // 高光
      const base = 185 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 2;
      b = base + 6;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 938) {
      world.set(x, y, 322);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 耐酸但缓慢溶解
      if (nid === 9 && Math.random() < 0.008) {
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

registerMaterial(Germanium);
