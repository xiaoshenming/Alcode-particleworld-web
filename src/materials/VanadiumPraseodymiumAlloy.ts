import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钒镨合金 —— 钒与镨的高强度合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2200° → 液态钒镨(1082)
 * - 耐酸腐蚀
 * - 银灰偏绿色调
 */

export const VanadiumPraseodymiumAlloy: MaterialDef = {
  id: 1081,
  name: '钒镨合金',
  category: '固体',
  description: '钒与镨的合金，结合钒的高强度与镨的稀土特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 170 + Math.floor(Math.random() * 18);
      g = 180 + Math.floor(Math.random() * 20);
      b = 172 + Math.floor(Math.random() * 16);
    } else if (phase < 0.8) {
      r = 180 + Math.floor(Math.random() * 10);
      g = 190 + Math.floor(Math.random() * 10);
      b = 182 + Math.floor(Math.random() * 10);
    } else {
      r = 168 + Math.floor(Math.random() * 8);
      g = 178 + Math.floor(Math.random() * 8);
      b = 170 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
      world.set(x, y, 1082);
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

registerMaterial(VanadiumPraseodymiumAlloy);
