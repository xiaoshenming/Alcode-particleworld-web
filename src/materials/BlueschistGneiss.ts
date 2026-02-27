import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蓝闪片岩 —— 高压变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1350° → 熔岩(11)
 * - 耐酸腐蚀
 * - 深蓝灰色带蓝闪石纹理
 */

export const BlueschistGneiss: MaterialDef = {
  id: 504,
  name: '蓝闪片岩',
  category: '固体',
  description: '高压变质岩，含蓝闪石矿物，指示俯冲带环境',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 55 + Math.floor(Math.random() * 12);
      g = 65 + Math.floor(Math.random() * 12);
      b = 105 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 70 + Math.floor(Math.random() * 10);
      g = 80 + Math.floor(Math.random() * 12);
      b = 130 + Math.floor(Math.random() * 15);
    } else {
      r = 42 + Math.floor(Math.random() * 8);
      g = 50 + Math.floor(Math.random() * 10);
      b = 85 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1350) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.002) {
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

registerMaterial(BlueschistGneiss);
