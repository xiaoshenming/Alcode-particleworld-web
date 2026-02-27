import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 气凝胶 —— 超轻质多孔固体
 * - 固体，不可移动
 * - 极佳隔热性：阻断热传导
 * - 极低密度但不移动（固体骨架）
 * - 遇水(2)吸水后碎裂为泡沫(51)
 * - 高温(>600)熔化为液态玻璃(92)
 * - 遇酸液(9)缓慢溶解
 * - 视觉上呈半透明淡蓝色
 */

export const Aerogel: MaterialDef = {
  id: 132,
  name: '气凝胶',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 半透明淡蓝
      r = 190 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 235 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 淡白蓝
      r = 210 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 15);
      b = 240 + Math.floor(Math.random() * 10);
    } else {
      // 微蓝透明
      r = 200 + Math.floor(Math.random() * 15);
      g = 215 + Math.floor(Math.random() * 15);
      b = 230 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为液态玻璃
    if (temp > 600) {
      world.set(x, y, 92); // 液态玻璃
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水碎裂为泡沫
      if (nid === 2 && Math.random() < 0.01) {
        world.set(x, y, 51); // 泡沫
        world.wakeArea(x, y);
        return;
      }

      // 遇酸液溶解
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 隔热：吸收邻居温度差
      if (Math.abs(world.getTemp(nx, ny) - temp) > 20 && Math.random() < 0.1) {
        world.addTemp(nx, ny, temp > world.getTemp(nx, ny) ? -3 : 3);
        world.addTemp(x, y, temp > world.getTemp(nx, ny) ? 3 : -3);
      }
    }

    // 极缓慢散热
    if (temp > 20 && Math.random() < 0.01) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Aerogel);
