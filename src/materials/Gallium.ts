import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 镓 —— 低熔点金属
 * - 固体，密度 Infinity（不可移动）
 * - 极低熔点：>30° → 液态镓(427)
 * - 手心温度即可融化的奇特金属
 * - 银白色带蓝色调
 */

export const Gallium: MaterialDef = {
  id: 426,
  name: '镓',
  category: '金属',
  description: '低熔点金属，手心温度即可融化，银白色带蓝色调',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 185 + Math.floor(Math.random() * 15);
      g = 190 + Math.floor(Math.random() * 12);
      b = 210 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 170 + Math.floor(Math.random() * 12);
      g = 178 + Math.floor(Math.random() * 10);
      b = 200 + Math.floor(Math.random() * 12);
    } else {
      r = 205 + Math.floor(Math.random() * 12);
      g = 210 + Math.floor(Math.random() * 10);
      b = 225 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极低熔点，30°即熔化
    if (temp > 30) {
      world.set(x, y, 427);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 被酸腐蚀
      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 3) {
          const diff = (nt - temp) * 0.12;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Gallium);
