import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铱合金 —— 超耐高温贵金属合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2200° → 液态铌铱(552)
 * - 极耐酸腐蚀
 * - 银白色带蓝灰金属光泽
 */

export const NiobiumIridiumAlloy: MaterialDef = {
  id: 551,
  name: '铌铱合金',
  category: '金属',
  description: '超耐高温贵金属合金，用于火箭喷嘴和高温催化',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 188 + Math.floor(Math.random() * 12);
      g = 192 + Math.floor(Math.random() * 10);
      b = 205 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      r = 208 + Math.floor(Math.random() * 14);
      g = 212 + Math.floor(Math.random() * 12);
      b = 225 + Math.floor(Math.random() * 10);
    } else {
      r = 168 + Math.floor(Math.random() * 10);
      g = 172 + Math.floor(Math.random() * 10);
      b = 188 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2200) {
      world.set(x, y, 552);
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

registerMaterial(NiobiumIridiumAlloy);
