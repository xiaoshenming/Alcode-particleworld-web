import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铪铼合金 —— 超高温耐热合金
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>3200° → 液态铪铼(412)
 * - 极耐腐蚀（酸概率0.0005）
 * - 优良导热
 * - 银灰色带蓝色调
 */

export const HafniumRhenium: MaterialDef = {
  id: 411,
  name: '铪铼合金',
  category: '金属',
  description: '铪与铼的超高温合金，熔点极高，用于航天发动机喷嘴',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰蓝
      r = 175 + Math.floor(Math.random() * 15);
      g = 182 + Math.floor(Math.random() * 12);
      b = 198 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗银蓝
      r = 150 + Math.floor(Math.random() * 12);
      g = 158 + Math.floor(Math.random() * 10);
      b = 178 + Math.floor(Math.random() * 10);
    } else {
      // 亮银高光
      r = 205 + Math.floor(Math.random() * 15);
      g = 210 + Math.floor(Math.random() * 12);
      b = 225 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 3200) {
      world.set(x, y, 412); // 液态铪铼
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐酸
      if (nid === 9 && Math.random() < 0.0005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 优良导热
      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.15;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(HafniumRhenium);
