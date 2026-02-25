import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 方解石 —— 白色半透明矿物（碳酸钙晶体）
 * - 固体，密度 Infinity（不可移动）
 * - 遇酸冒泡溶解（产生泡沫+CO₂烟）
 * - 高温(>825°)分解为石灰(124) + 烟（CO₂）
 * - 遇水不溶
 * - 白色半透明带彩虹折射
 */

export const Calcite: MaterialDef = {
  id: 214,
  name: '方解石',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 白色半透明
      r = 230 + Math.floor(Math.random() * 20);
      g = 228 + Math.floor(Math.random() * 20);
      b = 225 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 微黄色
      r = 235 + Math.floor(Math.random() * 15);
      g = 230 + Math.floor(Math.random() * 15);
      b = 210 + Math.floor(Math.random() * 20);
    } else {
      // 彩虹折射高光
      r = 220 + Math.floor(Math.random() * 30);
      g = 215 + Math.floor(Math.random() * 35);
      b = 230 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解：>825° → 石灰 + CO₂
    if (temp > 825) {
      world.set(x, y, 124); // 石灰
      // 释放CO₂烟
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 7); // 烟
        world.markUpdated(x, y - 1);
      }
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸冒泡溶解
      if ((nid === 9 || nid === 173 || nid === 183 || nid === 159) && Math.random() < 0.04) {
        world.set(x, y, 51); // 变泡沫
        world.set(nx, ny, 7); // 酸变烟（CO₂）
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }
    }
  },
};

registerMaterial(Calcite);
