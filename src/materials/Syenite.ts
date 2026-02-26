import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 正长岩 —— 碱性火成岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1150° → 熔岩(11)
 * - 耐酸中等（概率0.007）
 * - 导热中等
 * - 粉灰色带肉色调
 */

export const Syenite: MaterialDef = {
  id: 424,
  name: '正长岩',
  category: '矿石',
  description: '碱性火成岩，以正长石为主，粉灰色带肉红色调',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 粉灰肉色
      r = 195 + Math.floor(Math.random() * 18);
      g = 178 + Math.floor(Math.random() * 15);
      b = 170 + Math.floor(Math.random() * 12);
    } else if (phase < 0.65) {
      // 暗灰粉
      r = 170 + Math.floor(Math.random() * 12);
      g = 155 + Math.floor(Math.random() * 10);
      b = 148 + Math.floor(Math.random() * 10);
    } else if (phase < 0.85) {
      // 肉红色斑晶
      r = 210 + Math.floor(Math.random() * 15);
      g = 175 + Math.floor(Math.random() * 12);
      b = 162 + Math.floor(Math.random() * 10);
    } else {
      // 暗色矿物斑点
      r = 110 + Math.floor(Math.random() * 18);
      g = 105 + Math.floor(Math.random() * 12);
      b = 100 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1150) {
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

      if (nid === 9 && Math.random() < 0.007) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Syenite);
