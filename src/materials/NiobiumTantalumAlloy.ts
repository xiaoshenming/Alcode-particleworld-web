import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌钽合金 —— 超高温耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2400° → 液态铌钽(462)
 * - 极耐酸腐蚀，耐高温
 * - 深银灰色带紫色金属光泽
 */

export const NiobiumTantalumAlloy: MaterialDef = {
  id: 461,
  name: '铌钽合金',
  category: '金属',
  description: '超高温耐蚀合金，用于化工设备和核反应堆部件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 145 + Math.floor(Math.random() * 12);
      g = 142 + Math.floor(Math.random() * 10);
      b = 158 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 168 + Math.floor(Math.random() * 12);
      g = 165 + Math.floor(Math.random() * 10);
      b = 182 + Math.floor(Math.random() * 12);
    } else {
      r = 125 + Math.floor(Math.random() * 10);
      g = 120 + Math.floor(Math.random() * 10);
      b = 140 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2400) {
      world.set(x, y, 462);
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

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(NiobiumTantalumAlloy);
