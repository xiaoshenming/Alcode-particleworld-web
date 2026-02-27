import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌镍合金 —— 耐蚀超合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2300° → 液态铌镍(512)
 * - 极耐酸腐蚀
 * - 银白色带镍绿金属光泽
 */

export const NiobiumNickelAlloy: MaterialDef = {
  id: 511,
  name: '铌镍合金',
  category: '金属',
  description: '耐蚀超合金，用于化工反应器和燃气涡轮叶片',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 155 + Math.floor(Math.random() * 12);
      g = 162 + Math.floor(Math.random() * 12);
      b = 158 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 178 + Math.floor(Math.random() * 14);
      g = 185 + Math.floor(Math.random() * 12);
      b = 180 + Math.floor(Math.random() * 10);
    } else {
      r = 135 + Math.floor(Math.random() * 10);
      g = 142 + Math.floor(Math.random() * 10);
      b = 138 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2300) {
      world.set(x, y, 512);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0008) {
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

registerMaterial(NiobiumNickelAlloy);
