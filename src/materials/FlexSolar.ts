import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 柔性太阳能 —— 可弯曲的薄膜太阳能电池
 * - 固体，密度 Infinity（不可移动）
 * - 光照效果：上方无遮挡时持续发热（模拟太阳能转换）
 * - 接触电线(44)时传递能量（加热电线）
 * - 高温(>400°) → 损坏变为烟(7)
 * - 深蓝色带银色网格纹理
 */

export const FlexSolar: MaterialDef = {
  id: 325,
  name: '柔性太阳能',
  category: '特殊',
  description: '可弯曲的薄膜太阳能电池',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 深蓝基调
      r = 20 + Math.floor(Math.random() * 15);
      g = 35 + Math.floor(Math.random() * 15);
      b = 100 + Math.floor(Math.random() * 30);
    } else if (phase < 0.85) {
      // 银色网格线
      const base = 160 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 5;
      b = base + 10;
    } else {
      // 暗蓝
      r = 15 + Math.floor(Math.random() * 10);
      g = 25 + Math.floor(Math.random() * 10);
      b = 80 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过热损坏
    if (temp > 400) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 光照检测：检查上方是否有遮挡
    let sunlit = true;
    for (let sy = y - 1; sy >= Math.max(0, y - 10); sy--) {
      if (!world.isEmpty(x, sy)) {
        sunlit = false;
        break;
      }
    }

    // 太阳能发热
    if (sunlit && Math.random() < 0.3) {
      world.addTemp(x, y, 0.5);
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 向电线传递热量
      if (nid === 44 && sunlit && Math.random() < 0.2) {
        world.addTemp(nx, ny, 2);
        world.wakeArea(nx, ny);
      }

      // 酸腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 3) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(FlexSolar);
