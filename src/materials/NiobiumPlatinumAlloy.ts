import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铌铂合金 —— 贵金属耐高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2100° → 液态铌铂(547)
 * - 耐酸腐蚀
 * - 铂白色带银灰金属光泽
 */

export const NiobiumPlatinumAlloy: MaterialDef = {
  id: 546,
  name: '铌铂合金',
  category: '金属',
  description: '贵金属耐高温合金，用于催化剂载体和高温传感器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 195 + Math.floor(Math.random() * 12);
      g = 195 + Math.floor(Math.random() * 10);
      b = 200 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 215 + Math.floor(Math.random() * 14);
      g = 215 + Math.floor(Math.random() * 12);
      b = 222 + Math.floor(Math.random() * 10);
    } else {
      r = 175 + Math.floor(Math.random() * 10);
      g = 175 + Math.floor(Math.random() * 10);
      b = 182 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2100) {
      world.set(x, y, 547);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0005) {
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

registerMaterial(NiobiumPlatinumAlloy);
