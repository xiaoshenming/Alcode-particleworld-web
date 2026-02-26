import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铒 —— 稀土金属，银白色带粉红光泽
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1529° → 液态铒(397)
 * - 粉红色光泽是铒的特征，接触激光(47)产生粉红荧光
 * - 耐酸较弱（0.02）
 * - 导热
 */

export const Erbium: MaterialDef = {
  id: 396,
  name: '铒',
  category: '金属',
  description: '稀土金属，银白色带独特粉红光泽，用于光纤放大器和激光',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白带粉红
      r = 210 + Math.floor(Math.random() * 18);
      g = 195 + Math.floor(Math.random() * 12);
      b = 200 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 暗银粉
      r = 190 + Math.floor(Math.random() * 12);
      g = 175 + Math.floor(Math.random() * 10);
      b = 180 + Math.floor(Math.random() * 10);
    } else {
      // 亮粉银高光
      r = 230 + Math.floor(Math.random() * 18);
      g = 210 + Math.floor(Math.random() * 15);
      b = 218 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1529) {
      world.set(x, y, 397); // 液态铒
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触激光产生粉红荧光（火花）
      if (nid === 47 && Math.random() < 0.05) {
        for (const [dx2, dy2] of dirs) {
          const fx = x + dx2, fy = y + dy2;
          if (world.inBounds(fx, fy) && world.isEmpty(fx, fy)) {
            world.set(fx, fy, 28); // 火花
            world.wakeArea(fx, fy);
            break;
          }
        }
      }

      // 耐酸较弱
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.12;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Erbium);
