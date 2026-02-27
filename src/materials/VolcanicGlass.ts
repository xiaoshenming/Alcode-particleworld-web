import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 火山玻璃 —— 天然玻璃质火山岩
 * - 固体，密度 Infinity（不可移动）
 * - 极高硬度：不被酸腐蚀（除氟化氢208外）
 * - 高温(>1200°)重新熔化为熔岩(11)
 * - 锋利：接触生物材质有切割效果（小概率破坏）
 * - 深黑色带玻璃光泽
 */

export const VolcanicGlass: MaterialDef = {
  id: 229,
  name: '火山玻璃',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深黑色
      const base = 20 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 2;
      b = base + 5;
    } else if (phase < 0.8) {
      // 暗灰色
      const base = 35 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 1;
      b = base + 3;
    } else {
      // 玻璃光泽高光
      const base = 60 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 5;
      b = base + 12;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温重新熔化
    if (temp > 1200) {
      world.set(x, y, 11); // 熔岩
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

      // 仅氟化氢可腐蚀
      if (nid === 208 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 其他酸无效
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.008) {
        world.set(nx, ny, 7); // 酸蒸发
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 切割生物材质
      if ((nid === 13 || nid === 57 || nid === 59) && Math.random() < 0.01) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(VolcanicGlass);
