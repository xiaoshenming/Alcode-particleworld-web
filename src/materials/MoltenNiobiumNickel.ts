import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态铌镍 —— 铌镍合金的熔融态
 * - 液体，密度 8.9（重质液态金属）
 * - 冷却 <2200° → 铌镍合金(511)
 * - 高温发光，橙黄色熔融金属
 */

export const MoltenNiobiumNickel: MaterialDef = {
  id: 512,
  name: '液态铌镍',
  category: '液体',
  description: '铌镍合金的熔融态，高温重质液态金属',
  density: 8.9,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 255;
      g = 175 + Math.floor(Math.random() * 30);
      b = 70 + Math.floor(Math.random() * 30);
    } else if (phase < 0.8) {
      r = 255;
      g = 200 + Math.floor(Math.random() * 25);
      b = 130 + Math.floor(Math.random() * 30);
    } else {
      r = 240 + Math.floor(Math.random() * 15);
      g = 145 + Math.floor(Math.random() * 25);
      b = 45 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 2200) {
      world.set(x, y, 511);
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
      if (belowDensity < 8.9 && belowDensity !== Infinity && Math.random() < 0.7) {
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

registerMaterial(MoltenNiobiumNickel);
