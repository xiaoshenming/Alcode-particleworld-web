import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铼铥 —— 铼铥合金的熔融态
 * - 液体，密度 16.2
 * - 冷却 <4400° → 铼铥合金(1051)
 * - 高温流动金属
 */

export const MoltenRheniumThulium: MaterialDef = {
  id: 1052,
  name: '液态铼铥',
  category: '液体',
  description: '铼铥合金的熔融态，具有极高温度的流动金属',
  density: 16.2,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 240 + Math.floor(Math.random() * 16);
      g = 160 + Math.floor(Math.random() * 30);
      b = 80 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 245 + Math.floor(Math.random() * 11);
      g = 140 + Math.floor(Math.random() * 20);
      b = 60 + Math.floor(Math.random() * 15);
    } else {
      r = 250 + Math.floor(Math.random() * 6);
      g = 170 + Math.floor(Math.random() * 15);
      b = 90 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp < 4400) {
      world.set(x, y, 1051);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }
    const below = y + 1;
    if (world.inBounds(x, below)) {
      const bid = world.get(x, below);
      if (bid === 0) {
        world.set(x, y, 0);
        world.set(x, below, 1052);
        world.setTemp(x, below, temp);
        world.wakeArea(x, below);
        return;
      }
    }
    const dir = Math.random() < 0.5 ? -1 : 1;
    const sx = x + dir;
    if (world.inBounds(sx, y) && world.get(sx, y) === 0) {
      world.set(x, y, 0);
      world.set(sx, y, 1052);
      world.setTemp(sx, y, temp);
      world.wakeArea(sx, y);
      return;
    }
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(MoltenRheniumThulium);
