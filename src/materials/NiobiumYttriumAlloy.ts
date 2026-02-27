import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌钇合金 —— 高温结构合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2150° → 液态铌钇(582)
 * - 极耐酸腐蚀
 * - 银灰色带暖调金属光泽
 */

export const NiobiumYttriumAlloy: MaterialDef = {
  id: 581,
  name: '铌钇合金',
  category: '金属',
  description: '高温结构合金，用于超导线材和高温合金添加剂',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 175 + Math.floor(Math.random() * 12);
      g = 172 + Math.floor(Math.random() * 10);
      b = 168 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 195 + Math.floor(Math.random() * 14);
      g = 192 + Math.floor(Math.random() * 12);
      b = 185 + Math.floor(Math.random() * 10);
    } else {
      r = 158 + Math.floor(Math.random() * 10);
      g = 155 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2150) {
      world.set(x, y, 582);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
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
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(NiobiumYttriumAlloy);
