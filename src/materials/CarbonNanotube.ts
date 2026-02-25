import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 碳纳米管 —— 超强纳米材料
 * - 固体，密度 Infinity（不可移动）
 * - 极高强度：不被任何酸腐蚀
 * - 超导电：邻近电线(44)时增强电传导
 * - 超导热：快速传导热量
 * - 极高温(>3000°)才会燃烧
 * - 深黑色带微光泽
 */

export const CarbonNanotube: MaterialDef = {
  id: 245,
  name: '碳纳米管',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 深黑色
      const base = 15 + Math.floor(Math.random() * 12);
      r = base;
      g = base + 2;
      b = base + 4;
    } else if (phase < 0.85) {
      // 暗灰
      const base = 28 + Math.floor(Math.random() * 12);
      r = base;
      g = base + 1;
      b = base + 3;
    } else {
      // 微光泽
      const base = 45 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 5;
      b = base + 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温燃烧
    if (temp > 3000) {
      world.set(x, y, 6); // 火
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 所有酸无效（酸蒸发）
      if ((nid === 9 || nid === 173 || nid === 183 || nid === 208) && Math.random() < 0.01) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 超导热：快速均温
      if (nid !== 0 && Math.random() < 0.25) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 3) {
          const avg = (temp + nt) / 2;
          world.setTemp(x, y, avg);
          world.setTemp(nx, ny, avg);
        }
      }

      // 增强电线传导
      if (nid === 44) {
        world.addTemp(nx, ny, 2);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(CarbonNanotube);
