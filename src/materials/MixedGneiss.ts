import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 混合片麻岩 —— 高级变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 极耐高温（>2700° 才熔化为熔岩）
 * - 耐酸性好
 * - 灰白色带暗色条带纹理
 */

export const MixedGneiss: MaterialDef = {
  id: 449,
  name: '混合片麻岩',
  category: '固体',
  description: '高级变质岩，灰白色与暗色矿物交替形成条带状构造',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 浅灰白色条带
      r = 175 + Math.floor(Math.random() * 20);
      g = 170 + Math.floor(Math.random() * 18);
      b = 165 + Math.floor(Math.random() * 15);
    } else if (phase < 0.7) {
      // 暗色条带
      r = 70 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 12);
      b = 60 + Math.floor(Math.random() * 12);
    } else {
      // 中灰过渡
      r = 120 + Math.floor(Math.random() * 20);
      g = 115 + Math.floor(Math.random() * 15);
      b = 110 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 2700) {
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

      if (nid === 9 && Math.random() < 0.001) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.04;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(MixedGneiss);
