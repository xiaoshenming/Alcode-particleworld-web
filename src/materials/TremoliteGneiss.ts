import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 透闪石片麻岩 —— 含透闪石的片麻岩
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 >1130° → 熔岩(11)
 * - 较耐酸腐蚀
 * - 浅灰绿色带透闪石条纹纹理
 */

export const TremoliteGneiss: MaterialDef = {
  id: 709,
  name: '透闪石片麻岩',
  category: '固体',
  description: '含透闪石矿物的片麻岩，属于中级变质岩',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 168 + Math.floor(Math.random() * 12);
      g = 178 + Math.floor(Math.random() * 10);
      b = 165 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      r = 180 + Math.floor(Math.random() * 10);
      g = 192 + Math.floor(Math.random() * 10);
      b = 178 + Math.floor(Math.random() * 10);
    } else {
      r = 155 + Math.floor(Math.random() * 10);
      g = 168 + Math.floor(Math.random() * 10);
      b = 155 + Math.floor(Math.random() * 8);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp > 1130) {
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

      if (nid === 9 && Math.random() < 0.003) {
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

registerMaterial(TremoliteGneiss);
