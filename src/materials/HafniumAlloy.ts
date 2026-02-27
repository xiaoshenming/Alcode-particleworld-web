import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铪合金 —— 铪基高温合金，极耐高温和腐蚀
 * - 固体，密度 Infinity（不可移动）
 * - 极高熔点 >2500° → 变为液态铪合金(292)
 * - 极耐腐蚀：普通酸(9)几乎无效，强酸(173/183)极慢
 * - 良好导热
 * - 深银灰色带蓝调
 */

export const HafniumAlloy: MaterialDef = {
  id: 291,
  name: '铪合金',
  category: '金属',
  description: '铪基高温合金，极耐高温和腐蚀',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.45) {
      // 银蓝基底
      const base = 155 + Math.floor(Math.random() * 20);
      r = base - 10;
      g = base;
      b = base + 18;
    } else if (phase < 0.75) {
      // 暗灰蓝
      const base = 120 + Math.floor(Math.random() * 15);
      r = base - 5;
      g = base + 2;
      b = base + 15;
    } else {
      // 高光白蓝
      const base = 200 + Math.floor(Math.random() * 25);
      r = base - 8;
      g = base;
      b = base + 12;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温(>2500°)熔化为液态铪合金
    if (temp > 2500) {
      world.set(x, y, 292); // 液态铪合金
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 极耐腐蚀：普通酸几乎无效，强酸极慢
      if (nid === 9 && Math.random() < 0.001) {
        world.set(nx, ny, 7); // 酸蒸发为烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      } else if ((nid === 173 || nid === 183) && Math.random() < 0.005) {
        world.set(nx, ny, 7); // 强酸极慢消耗
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 良好导热
      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const avg = (temp + nt) / 2;
          world.setTemp(x, y, avg);
          world.setTemp(nx, ny, avg);
        }
      }
    }
  },
};

registerMaterial(HafniumAlloy);
