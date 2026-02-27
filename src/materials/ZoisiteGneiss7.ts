import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 黝帘石片麻岩(7) —— 黝帘石与片麻岩的高级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1020° → 熔岩(11)
 * - 热传导 0.04/0.05
 * - 灰绿色调，具有柱状晶体纹理
 */

export const ZoisiteGneiss7: MaterialDef = {
  id: 1224,
  name: '黝帘石片麻岩(7)',
  category: '固体',
  description: '黝帘石与片麻岩的高级变质岩，具有柱状晶体纹理',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 138 + Math.floor(Math.random() * 22);
      g = 158 + Math.floor(Math.random() * 22);
      b = 142 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 138 + Math.floor(Math.random() * 11);
      g = 158 + Math.floor(Math.random() * 11);
      b = 142 + Math.floor(Math.random() * 10);
    } else {
      r = 138 + Math.floor(Math.random() * 8);
      g = 158 + Math.floor(Math.random() * 8);
      b = 142 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1020 && Math.random() < 0.0008) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(ZoisiteGneiss7);
