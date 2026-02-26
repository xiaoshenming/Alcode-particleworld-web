import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌钴合金 —— 高温磁性合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2200° → 液态铌钴(507)
 * - 耐酸腐蚀
 * - 银灰色带钴蓝金属光泽
 */

export const NiobiumCobaltAlloy: MaterialDef = {
  id: 506,
  name: '铌钴合金',
  category: '金属',
  description: '高温磁性合金，用于磁性存储器和高温磁体',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 142 + Math.floor(Math.random() * 12);
      g = 148 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 165 + Math.floor(Math.random() * 14);
      g = 170 + Math.floor(Math.random() * 12);
      b = 190 + Math.floor(Math.random() * 10);
    } else {
      r = 122 + Math.floor(Math.random() * 10);
      g = 128 + Math.floor(Math.random() * 10);
      b = 145 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
      world.set(x, y, 507);
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

registerMaterial(NiobiumCobaltAlloy);
