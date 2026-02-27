import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

export const TungstenEuropiumAlloy: MaterialDef = {
  id: 1016,
  name: '钨铕合金',
  category: '金属',
  description: '钨铕高温合金，用于荧光体基底和中子探测器电极',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 196 + Math.floor(Math.random() * 20);
      g = 194 + Math.floor(Math.random() * 20);
      b = 202 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 206 + Math.floor(Math.random() * 10);
      g = 204 + Math.floor(Math.random() * 10);
      b = 212 + Math.floor(Math.random() * 10);
    } else {
      r = 196 + Math.floor(Math.random() * 8);
      g = 194 + Math.floor(Math.random() * 8);
      b = 202 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    if (temp > 3460) {
      world.set(x, y, 1017);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }
    const dirs = DIRS4;
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
registerMaterial(TungstenEuropiumAlloy);
