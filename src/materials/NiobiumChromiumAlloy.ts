import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铬合金 —— 高温抗氧化合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2400° → 液态铌铬(487)
 * - 极耐酸腐蚀
 * - 亮银色带冷蓝金属光泽
 */

export const NiobiumChromiumAlloy: MaterialDef = {
  id: 486,
  name: '铌铬合金',
  category: '金属',
  description: '高温抗氧化合金，用于燃气轮机和高温炉衬',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 12);
      g = 160 + Math.floor(Math.random() * 12);
      b = 170 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 175 + Math.floor(Math.random() * 14);
      g = 180 + Math.floor(Math.random() * 12);
      b = 192 + Math.floor(Math.random() * 10);
    } else {
      r = 135 + Math.floor(Math.random() * 10);
      g = 140 + Math.floor(Math.random() * 10);
      b = 150 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2400) {
      world.set(x, y, 487);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
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

registerMaterial(NiobiumChromiumAlloy);
