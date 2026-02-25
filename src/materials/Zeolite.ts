import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 沸石 —— 多孔吸附矿石
 * - 固体，不可移动
 * - 吸附周围的毒气(18)/沼气(95)/烟(7)，净化空气
 * - 吸附水(2)后释放热量（微量加热）
 * - 高温(>600)释放吸附的气体（再生）
 * - 遇酸液(9)缓慢腐蚀
 * - 视觉上呈灰白色多孔纹理
 */

export const Zeolite: MaterialDef = {
  id: 116,
  name: '沸石',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 灰白色
      r = 200 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 20);
      b = 185 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 浅米色
      r = 210 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 15);
      b = 175 + Math.floor(Math.random() * 15);
    } else if (t < 0.9) {
      // 暗灰孔洞
      r = 170 + Math.floor(Math.random() * 20);
      g = 165 + Math.floor(Math.random() * 20);
      b = 155 + Math.floor(Math.random() * 20);
    } else {
      // 淡绿灰
      r = 185 + Math.floor(Math.random() * 15);
      g = 200 + Math.floor(Math.random() * 15);
      b = 180 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温释放气体（再生）
    if (temp > 600) {
      const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny) && Math.random() < 0.1) {
          world.set(nx, ny, 7); // 释放烟
          world.markUpdated(nx, ny);
          world.wakeArea(nx, ny);
        }
      }
      world.addTemp(x, y, -10);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 吸附毒气/沼气/烟
      if ((nid === 18 || nid === 95 || nid === 7) && Math.random() < 0.08) {
        world.set(nx, ny, 0); // 吸附消除
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 吸附水后微量加热
      if (nid === 2 && Math.random() < 0.01) {
        world.addTemp(x, y, 2);
      }

      // 酸液腐蚀
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Zeolite);
