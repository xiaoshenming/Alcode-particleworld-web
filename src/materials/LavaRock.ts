import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 熔岩石 —— 多孔火山岩石
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>1000°)重新熔化为熔岩(11)
 * - 遇水(2)产生少量蒸汽(8)（余热）
 * - 多孔结构：深灰色带红棕色斑点
 * - 比普通石头(3)更耐酸
 */

export const LavaRock: MaterialDef = {
  id: 204,
  name: '熔岩石',
  color() {
    // 多孔结构：深灰色带红棕色斑点
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.45) {
      // 深灰色基底
      r = 50 + Math.floor(Math.random() * 18);
      g = 48 + Math.floor(Math.random() * 15);
      b = 52 + Math.floor(Math.random() * 12);
    } else if (phase < 0.75) {
      // 红棕色斑点
      r = 80 + Math.floor(Math.random() * 25);
      g = 40 + Math.floor(Math.random() * 15);
      b = 30 + Math.floor(Math.random() * 12);
    } else if (phase < 0.9) {
      // 暗黑色孔洞
      r = 30 + Math.floor(Math.random() * 12);
      g = 28 + Math.floor(Math.random() * 10);
      b = 32 + Math.floor(Math.random() * 10);
    } else {
      // 亮灰纹理
      r = 70 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 12);
      b = 68 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温(>1000°)重新熔化为熔岩
    if (temp > 1000) {
      world.set(x, y, 11); // 熔岩
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水产生少量蒸汽（余热效果）
      if (nid === 2 && Math.random() < 0.02) {
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        continue;
      }

      // 比普通石头更耐酸（概率 0.002，石头约 0.01，岩浆岩 0.005）
      if (nid === 9 && Math.random() < 0.002) {
        world.set(x, y, 0); // 被腐蚀
        world.set(nx, ny, 7); // 酸变烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 高温时缓慢向周围传热（余热散发）
    if (temp > 50) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.getTemp(nx, ny) < temp) {
          world.addTemp(nx, ny, 0.2);
          world.addTemp(x, y, -0.2);
        }
      }
    }
  },
};

registerMaterial(LavaRock);
