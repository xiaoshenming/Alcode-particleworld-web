import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 钒镧合金 —— 钒与镧的高强度合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2200° → 液态钒镧(1077)
 * - 耐酸腐蚀
 * - 银灰偏暖色调
 */

export const VanadiumLanthanumAlloy: MaterialDef = {
  id: 1076,
  name: '钒镧合金',
  category: '固体',
  description: '钒与镧的合金，结合钒的高强度与镧的稀土特性',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 178 + Math.floor(Math.random() * 20);
      g = 175 + Math.floor(Math.random() * 18);
      b = 170 + Math.floor(Math.random() * 16);
    } else if (phase < 0.8) {
      r = 188 + Math.floor(Math.random() * 10);
      g = 184 + Math.floor(Math.random() * 10);
      b = 178 + Math.floor(Math.random() * 10);
    } else {
      r = 175 + Math.floor(Math.random() * 8);
      g = 172 + Math.floor(Math.random() * 8);
      b = 168 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
      world.set(x, y, 1077);
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

registerMaterial(VanadiumLanthanumAlloy);
