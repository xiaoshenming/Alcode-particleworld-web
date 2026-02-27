import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 石灰石 (CaCO₃) —— 常见沉积岩
 * - 固体，密度无限，不可移动
 * - 遇酸(9)/硫酸(173)/硝酸(183)缓慢溶解，产生泡沫(51)
 * - 高温(>900°)分解为石灰(124)+烟(7)（煅烧反应）
 * - 遇水(2)极缓慢侵蚀
 * - 灰白色带浅黄纹理
 */

/** 酸性材质 ID */
const ACIDS = new Set([9, 173, 183]); // 酸液、硫酸、硝酸

export const Limestone: MaterialDef = {
  id: 195,
  name: '石灰石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 灰白色基底
      r = 200 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 20);
      b = 185 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 浅黄纹理
      r = 210 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 15);
      b = 170 + Math.floor(Math.random() * 20);
    } else {
      // 浅灰色斑点
      r = 185 + Math.floor(Math.random() * 15);
      g = 185 + Math.floor(Math.random() * 15);
      b = 180 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 煅烧：>900° 分解为石灰 + 烟（CO₂）
    if (temp > 900) {
      world.set(x, y, 124); // 石灰
      // 释放 CO₂（烟）
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 7); // 烟
        world.markUpdated(x, y - 1);
      }
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸缓慢溶解，产生泡沫
      if (ACIDS.has(nid) && Math.random() < 0.04) {
        world.set(x, y, 51); // 石灰石变泡沫（溶解）
        world.set(nx, ny, 0); // 酸液消耗
        world.wakeArea(x, y);
        world.markUpdated(nx, ny);
        return;
      }

      // 遇水极缓慢侵蚀
      if (nid === 2 && Math.random() < 0.001) {
        world.set(x, y, 0); // 侵蚀消失
        world.wakeArea(x, y);
        return;
      }
    }

    // 缓慢散热
    if (temp > 30) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 5) {
          world.addTemp(nx, ny, 1);
          world.addTemp(x, y, -1);
        }
      }
    }
  },
};

registerMaterial(Limestone);
