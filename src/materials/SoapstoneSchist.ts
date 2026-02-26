import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 皂石片岩 —— 含皂石的变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1050° → 熔岩(11)
 * - 较易被酸腐蚀
 * - 灰绿色带滑腻质感纹理
 */

export const SoapstoneSchist: MaterialDef = {
  id: 589,
  name: '皂石片岩',
  category: '固体',
  description: '含皂石矿物的变质岩，质地柔软易加工，用于雕刻和耐火材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 142 + Math.floor(Math.random() * 12);
      g = 158 + Math.floor(Math.random() * 12);
      b = 148 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 158 + Math.floor(Math.random() * 12);
      g = 175 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 10);
    } else {
      r = 128 + Math.floor(Math.random() * 10);
      g = 142 + Math.floor(Math.random() * 10);
      b = 135 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1050) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
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

registerMaterial(SoapstoneSchist);
