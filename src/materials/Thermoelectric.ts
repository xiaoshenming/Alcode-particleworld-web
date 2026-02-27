import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热电材料 —— 温差发电材料
 * - 固体，密度 Infinity（不可移动）
 * - 核心特性：检测两侧温差，温差越大越活跃
 * - 温差>50°时：唤醒邻近电线(44)，模拟发电
 * - 温差>100°时：产生微弱光热
 * - 酸可腐蚀
 * - 深灰色带红蓝双色条纹
 */

export const Thermoelectric: MaterialDef = {
  id: 290,
  name: '热电材料',
  category: '特殊',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰
      const base = 60 + Math.floor(Math.random() * 15);
      r = base;
      g = base;
      b = base;
    } else if (phase < 0.6) {
      // 红色条纹（热端）
      r = 100 + Math.floor(Math.random() * 30);
      g = 40 + Math.floor(Math.random() * 15);
      b = 35 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 蓝色条纹（冷端）
      r = 35 + Math.floor(Math.random() * 10);
      g = 45 + Math.floor(Math.random() * 15);
      b = 100 + Math.floor(Math.random() * 30);
    } else {
      // 暗银
      const base = 80 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 5;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化
    if (temp > 600) {
      world.set(x, y, 7); // 烟（材料分解）
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;

    // 计算最大温差
    let maxDiff = 0;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid !== 0) {
        const nt = world.getTemp(nx, ny);
        const diff = Math.abs(temp - nt);
        if (diff > maxDiff) maxDiff = diff;
      }
    }

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 温差发电：唤醒邻近电线
      if (maxDiff > 50 && (nid === 44 || nid === 280 || nid === 285)) {
        world.wakeArea(nx, ny);
      }

      // 大温差时产生微弱热量（电阻热）
      if (maxDiff > 100 && nid !== 0 && Math.random() < 0.05) {
        world.addTemp(nx, ny, 1);
      }

      // 酸腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 强酸
      if ((nid === 173 || nid === 183) && Math.random() < 0.04) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 导热（中等，热电材料需要传导热量）
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Thermoelectric);
