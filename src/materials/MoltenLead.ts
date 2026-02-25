import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铅 —— 银灰色低温液态重金属
 * - 液体，密度 9.0（非常重）
 * - 温度<327° 凝固为铅(226)
 * - 接触水产生蒸汽并污染
 * - 有毒蒸气
 */

export const MoltenLead: MaterialDef = {
  id: 227,
  name: '液态铅',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 银灰色带暖色
      r = 185 + Math.floor(Math.random() * 30);
      g = 175 + Math.floor(Math.random() * 30);
      b = 165 + Math.floor(Math.random() * 25);
    } else {
      // 亮银色
      r = 200 + Math.floor(Math.random() * 30);
      g = 195 + Math.floor(Math.random() * 25);
      b = 190 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 9.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    world.setTemp(x, y, Math.max(temp, 350));
    world.wakeArea(x, y);
    world.set(x, y, 227);

    // 冷却凝固
    if (temp < 327) {
      world.set(x, y, 226);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水产生蒸汽
      if (nid === 2) {
        world.set(nx, ny, 8);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 释放毒气
      if (world.isEmpty(nx, ny) && Math.random() < 0.005) {
        world.set(nx, ny, 18); // 毒气
        world.markUpdated(nx, ny);
      }
    }

    // 快速散热（低熔点）
    if (Math.random() < 0.05) {
      world.addTemp(x, y, -8);
    }

    // === 液体流动（很重，快速下沉） ===
    if (y >= world.height - 1) return;

    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换（非常重，沉入几乎所有液体）
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 9.0 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 缓慢水平流动
    if (Math.random() < 0.15) {
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
      }
    }
  },
};

registerMaterial(MoltenLead);
