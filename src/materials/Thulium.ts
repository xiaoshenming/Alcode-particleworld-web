import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铥 —— 稀土金属，银灰色带微蓝光泽
 * - 固体，密度 Infinity（不可移动）
 * - 熔点：>1545° → 液态铥(392)
 * - 可用作便携式X射线源，接触电线(44)产生闪光
 * - 耐酸较弱（0.02）
 * - 导热
 */

export const Thulium: MaterialDef = {
  id: 391,
  name: '铥',
  category: '金属',
  description: '稀土金属，银灰色带微蓝光泽，可用作便携式X射线源',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银灰带微蓝
      r = 185 + Math.floor(Math.random() * 15);
      g = 190 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗银蓝
      r = 165 + Math.floor(Math.random() * 12);
      g = 170 + Math.floor(Math.random() * 12);
      b = 182 + Math.floor(Math.random() * 12);
    } else {
      // 亮银蓝高光
      r = 210 + Math.floor(Math.random() * 18);
      g = 215 + Math.floor(Math.random() * 15);
      b = 228 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 1545) {
      world.set(x, y, 392); // 液态铥
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触电线产生闪光（X射线源特性）
      if (nid === 44 && Math.random() < 0.04) {
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

registerMaterial(Thulium);
