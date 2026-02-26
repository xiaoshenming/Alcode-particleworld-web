import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌钒合金 —— 高强度低密度合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2300° → 液态铌钒(492)
 * - 耐酸腐蚀
 * - 浅银色带暖灰金属光泽
 */

export const NiobiumVanadiumAlloy: MaterialDef = {
  id: 491,
  name: '铌钒合金',
  category: '金属',
  description: '高强度低密度合金，用于超导磁体和航空结构件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 162 + Math.floor(Math.random() * 12);
      g = 160 + Math.floor(Math.random() * 10);
      b = 156 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 185 + Math.floor(Math.random() * 14);
      g = 182 + Math.floor(Math.random() * 12);
      b = 178 + Math.floor(Math.random() * 10);
    } else {
      r = 142 + Math.floor(Math.random() * 10);
      g = 138 + Math.floor(Math.random() * 10);
      b = 134 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2300) {
      world.set(x, y, 492);
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

registerMaterial(NiobiumVanadiumAlloy);
