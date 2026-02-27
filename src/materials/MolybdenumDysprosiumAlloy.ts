import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

export const MolybdenumDysprosiumAlloy: MaterialDef = {
  id: 946,
  name: '钼镝合金',
  category: '金属',
  description: '钼镝高温合金，用于核反应堆控制棒和高温磁性器件',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 188 + Math.floor(Math.random() * 20);
      g = 186 + Math.floor(Math.random() * 20);
      b = 194 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 198 + Math.floor(Math.random() * 10);
      g = 196 + Math.floor(Math.random() * 10);
      b = 204 + Math.floor(Math.random() * 10);
    } else {
      r = 188 + Math.floor(Math.random() * 8);
      g = 186 + Math.floor(Math.random() * 8);
      b = 194 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 2540) {
      world.set(x, y, 947);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }
    const dirs = DIRS4;
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
registerMaterial(MolybdenumDysprosiumAlloy);
