import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钛铌合金 —— 高强度耐腐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1900° → 液态钛铌(457)
 * - 极耐酸腐蚀
 * - 银灰色带蓝色金属光泽
 */

export const TitaniumNiobiumAlloy: MaterialDef = {
  id: 456,
  name: '钛铌合金',
  category: '金属',
  description: '高强度耐腐蚀合金，用于航空发动机和医疗植入物',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 15);
      g = 162 + Math.floor(Math.random() * 12);
      b = 175 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 175 + Math.floor(Math.random() * 12);
      g = 180 + Math.floor(Math.random() * 10);
      b = 195 + Math.floor(Math.random() * 12);
    } else {
      r = 135 + Math.floor(Math.random() * 10);
      g = 140 + Math.floor(Math.random() * 10);
      b = 160 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1900) {
      world.set(x, y, 457);
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

registerMaterial(TitaniumNiobiumAlloy);
