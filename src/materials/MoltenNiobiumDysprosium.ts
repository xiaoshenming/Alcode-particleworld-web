import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铌镝 —— 铌镝合金的熔融态
 * - 液体，密度 6.8（中重质液态金属）
 * - 冷却 <2150° → 铌镝合金(601)
 * - 高温发光，银紫色熔融金属
 */

export const MoltenNiobiumDysprosium: MaterialDef = {
  id: 602,
  name: '液态铌镝',
  category: '液体',
  description: '铌镝合金的熔融态，高温中重质液态金属',
  density: 6.8,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 228 + Math.floor(Math.random() * 12);
      g = 218 + Math.floor(Math.random() * 10);
      b = 248 + Math.floor(Math.random() * 7);
    } else if (phase < 0.8) {
      r = 242 + Math.floor(Math.random() * 10);
      g = 232 + Math.floor(Math.random() * 8);
      b = 255;
    } else {
      r = 215 + Math.floor(Math.random() * 15);
      g = 205 + Math.floor(Math.random() * 12);
      b = 238 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 2150) {
      world.set(x, y, 601);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const below = world.get(x, y + 1);
    if (world.inBounds(x, y + 1)) {
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 6.8 && belowDensity !== Infinity && Math.random() < 0.7) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
    const sx = x + dir;
    if (world.inBounds(sx, y) && world.get(sx, y) === 0) {
      world.swap(x, y, sx, y);
      world.wakeArea(sx, y);
      return;
    }
    const sx2 = x - dir;
    if (world.inBounds(sx2, y) && world.get(sx2, y) === 0) {
      world.swap(x, y, sx2, y);
      world.wakeArea(sx2, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if ((nid === 4 || nid === 5 || nid === 22 || nid === 134) && Math.random() < 0.3) {
        world.set(nx, ny, 6);
        world.wakeArea(nx, ny);
      }

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(MoltenNiobiumDysprosium);
