import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌钼合金 —— 高温耐蚀结构合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2600° → 液态铌钼(477)
 * - 极耐酸腐蚀
 * - 冷银色带蓝灰金属光泽
 */

export const NiobiumMolybdenumAlloy: MaterialDef = {
  id: 476,
  name: '铌钼合金',
  category: '金属',
  description: '高温耐蚀结构合金，用于化工设备和航空涡轮叶片',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 148 + Math.floor(Math.random() * 12);
      g = 152 + Math.floor(Math.random() * 12);
      b = 160 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 170 + Math.floor(Math.random() * 14);
      g = 175 + Math.floor(Math.random() * 12);
      b = 185 + Math.floor(Math.random() * 10);
    } else {
      r = 128 + Math.floor(Math.random() * 10);
      g = 132 + Math.floor(Math.random() * 10);
      b = 140 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2600) {
      world.set(x, y, 477);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
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

registerMaterial(NiobiumMolybdenumAlloy);
