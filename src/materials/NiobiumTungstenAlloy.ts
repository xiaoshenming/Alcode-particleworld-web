import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铌钨合金 —— 超高温耐热合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2800° → 液态铌钨(502)
 * - 极耐酸腐蚀
 * - 深银灰色带钨蓝金属光泽
 */

export const NiobiumTungstenAlloy: MaterialDef = {
  id: 501,
  name: '铌钨合金',
  category: '金属',
  description: '超高温耐热合金，用于航天发动机喷嘴和核反应堆部件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 138 + Math.floor(Math.random() * 12);
      g = 142 + Math.floor(Math.random() * 10);
      b = 155 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 160 + Math.floor(Math.random() * 14);
      g = 165 + Math.floor(Math.random() * 12);
      b = 180 + Math.floor(Math.random() * 10);
    } else {
      r = 118 + Math.floor(Math.random() * 10);
      g = 122 + Math.floor(Math.random() * 10);
      b = 135 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2800) {
      world.set(x, y, 502);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0006) {
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

registerMaterial(NiobiumTungstenAlloy);
