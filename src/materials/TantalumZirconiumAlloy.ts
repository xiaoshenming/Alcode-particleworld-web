import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽锆合金 —— 高温耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2680° → 液态钽锆(687)
 * - 极耐酸腐蚀
 * - 银灰色带暗锆褐调金属光泽
 */

export const TantalumZirconiumAlloy: MaterialDef = {
  id: 686,
  name: '钽锆合金',
  category: '金属',
  description: '高温耐蚀合金，用于核反应堆和化工设备',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 165 + Math.floor(Math.random() * 12);
      g = 160 + Math.floor(Math.random() * 10);
      b = 155 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 178 + Math.floor(Math.random() * 14);
      g = 172 + Math.floor(Math.random() * 12);
      b = 168 + Math.floor(Math.random() * 10);
    } else {
      r = 150 + Math.floor(Math.random() * 10);
      g = 145 + Math.floor(Math.random() * 10);
      b = 140 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2680) {
      world.set(x, y, 687);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0002) {
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

registerMaterial(TantalumZirconiumAlloy);
