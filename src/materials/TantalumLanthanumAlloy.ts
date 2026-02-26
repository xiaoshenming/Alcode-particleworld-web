import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钽镧合金 —— 稀土增强高温合金
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >2300° → 液态钽镧(777)
 * - 极耐酸腐蚀
 * - 银灰色带淡暖色调
 */

export const TantalumLanthanumAlloy: MaterialDef = {
  id: 776,
  name: '钽镧合金',
  category: '金属',
  description: '稀土增强高温合金，用于航空发动机和化工设备',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 186 + Math.floor(Math.random() * 20);
      g = 190 + Math.floor(Math.random() * 20);
      b = 198 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 196 + Math.floor(Math.random() * 10);
      g = 200 + Math.floor(Math.random() * 10);
      b = 208 + Math.floor(Math.random() * 10);
    } else {
      r = 186 + Math.floor(Math.random() * 8);
      g = 190 + Math.floor(Math.random() * 8);
      b = 198 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2300) {
      world.set(x, y, 777);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.0002) {
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

registerMaterial(TantalumLanthanumAlloy);
