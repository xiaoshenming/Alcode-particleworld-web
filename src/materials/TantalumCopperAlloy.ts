import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽铜合金 —— 高导电耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2200° → 液态钽铜(702)
 * - 耐酸腐蚀
 * - 铜红色带银灰钽调金属光泽
 */

export const TantalumCopperAlloy: MaterialDef = {
  id: 701,
  name: '钽铜合金',
  category: '金属',
  description: '高导电耐蚀合金，用于电子连接器和散热器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 178 + Math.floor(Math.random() * 12);
      g = 128 + Math.floor(Math.random() * 10);
      b = 112 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 192 + Math.floor(Math.random() * 14);
      g = 142 + Math.floor(Math.random() * 12);
      b = 125 + Math.floor(Math.random() * 10);
    } else {
      r = 165 + Math.floor(Math.random() * 10);
      g = 118 + Math.floor(Math.random() * 10);
      b = 105 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
      world.set(x, y, 702);
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
          const diff = (nt - temp) * 0.09;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(TantalumCopperAlloy);
