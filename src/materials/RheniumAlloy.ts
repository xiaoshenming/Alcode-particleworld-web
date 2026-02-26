import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铼合金 —— 超高熔点合金，航空发动机材料
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点：>3180° → 变为液态铼合金(302)
 * - 极耐腐蚀：普通酸几乎无效，强酸极慢腐蚀
 * - 优良导热（概率0.12）
 * - 银白色带蓝调金属光泽
 */

export const RheniumAlloy: MaterialDef = {
  id: 301,
  name: '铼合金',
  category: '金属',
  description: '超高熔点合金，航空发动机核心材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银白蓝
      const base = 170 + Math.floor(Math.random() * 20);
      r = base - 8;
      g = base;
      b = base + 15;
    } else if (phase < 0.7) {
      // 暗银蓝
      const base = 135 + Math.floor(Math.random() * 15);
      r = base - 10;
      g = base - 3;
      b = base + 20;
    } else {
      // 高光银白
      const base = 200 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 3;
      b = base + 10;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高熔点：>3180° 熔化为液态铼合金
    if (temp > 3180) {
      world.set(x, y, 302);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐腐蚀：普通酸(9)几乎无效
      if (nid === 9 && Math.random() < 0.0008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸极慢腐蚀
      if ((nid === 173 || nid === 183) && Math.random() < 0.002) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 优良导热
      if (nid !== 0 && Math.random() < 0.12) {
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

registerMaterial(RheniumAlloy);
