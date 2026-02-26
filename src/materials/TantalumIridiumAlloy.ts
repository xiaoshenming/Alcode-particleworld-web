import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽铱合金 —— 超高温耐蚀合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2600° → 液态钽铱(737)
 * - 极耐酸腐蚀
 * - 银灰色带铱金属光泽
 */

export const TantalumIridiumAlloy: MaterialDef = {
  id: 736,
  name: '钽铱合金',
  category: '金属',
  description: '超高温耐蚀合金，用于极端环境下的耐蚀结构件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 188 + Math.floor(Math.random() * 12);
      g = 192 + Math.floor(Math.random() * 10);
      b = 198 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 200 + Math.floor(Math.random() * 8);
      g = 204 + Math.floor(Math.random() * 8);
      b = 210 + Math.floor(Math.random() * 8);
    } else {
      r = 188 + Math.floor(Math.random() * 10);
      g = 192 + Math.floor(Math.random() * 10);
      b = 198 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2600) {
      world.set(x, y, 737);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0001) {
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

registerMaterial(TantalumIridiumAlloy);
