import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 压电薄膜 —— 压力-电能转换材料
 * - 固体，密度 Infinity（不可移动）
 * - 受压（上方有重物）时向邻近电线(44)传递能量
 * - 受压时发出微弱闪光
 * - 高温(>250°)损坏变为烟
 * - 半透明蓝灰色
 */

export const PiezoFilm: MaterialDef = {
  id: 270,
  name: '压电薄膜',
  category: '特殊',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 蓝灰
      r = 100 + Math.floor(Math.random() * 20);
      g = 115 + Math.floor(Math.random() * 20);
      b = 145 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 浅蓝
      r = 120 + Math.floor(Math.random() * 15);
      g = 135 + Math.floor(Math.random() * 15);
      b = 165 + Math.floor(Math.random() * 20);
    } else {
      // 高光
      r = 150 + Math.floor(Math.random() * 20);
      g = 165 + Math.floor(Math.random() * 20);
      b = 195 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温损坏
    if (temp > 250) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 检测上方压力：上方有非空非气体粒子
    let pressured = false;
    if (y > 0 && !world.isEmpty(x, y - 1)) {
      const aboveDensity = world.getDensity(x, y - 1);
      if (aboveDensity > 1) {
        pressured = true;
      }
    }

    // 受压时的效果
    if (pressured) {
      const dirs = DIRS4;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        // 向邻近电线传递能量（唤醒电线）
        if (nid === 44) {
          world.wakeArea(nx, ny);
          world.addTemp(nx, ny, 1);
        }

        // 向邻近闪电球/电弧传递能量
        if (nid === 111 || nid === 145) {
          world.wakeArea(nx, ny);
        }
      }

      // 受压闪光：刷新颜色
      if (Math.random() < 0.3) {
        world.set(x, y, 270);
      }
    }

    // 导热
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.06;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(PiezoFilm);
