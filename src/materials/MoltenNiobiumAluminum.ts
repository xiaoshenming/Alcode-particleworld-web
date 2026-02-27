import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态铌铝 —— 铌铝合金的熔融态
 * - 液体，密度 7.5（重质液态金属）
 * - 冷却 <1900° → 铌铝合金(521)
 * - 高温发光，亮橙色熔融金属
 */

export const MoltenNiobiumAluminum: MaterialDef = {
  id: 522,
  name: '液态铌铝',
  category: '液体',
  description: '铌铝合金的熔融态，高温重质液态金属',
  density: 7.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 255;
      g = 185 + Math.floor(Math.random() * 30);
      b = 75 + Math.floor(Math.random() * 30);
    } else if (phase < 0.8) {
      r = 255;
      g = 210 + Math.floor(Math.random() * 25);
      b = 135 + Math.floor(Math.random() * 30);
    } else {
      r = 245 + Math.floor(Math.random() * 10);
      g = 155 + Math.floor(Math.random() * 25);
      b = 50 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 1900) {
      world.set(x, y, 521);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 液体流动
    const below = world.get(x, y + 1);
    if (world.inBounds(x, y + 1)) {
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 7.5 && belowDensity !== Infinity && Math.random() < 0.7) {
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

    // 点燃可燃物
    const dirs = DIRS4;
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

registerMaterial(MoltenNiobiumAluminum);
