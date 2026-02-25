import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 蜂蜜 —— 高粘度液体，流动缓慢，可粘住轻质粒子 */
export const Honey: MaterialDef = {
  id: 45,
  name: '蜂蜜',
  color() {
    const r = 220 + Math.floor(Math.random() * 20);
    const g = 160 + Math.floor(Math.random() * 20);
    const b = 20 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3,
  update(x: number, y: number, world: WorldAPI) {
    // 高温变稀（流动更快）
    const temp = world.getTemp(x, y);
    // 超高温蒸发
    if (temp > 200) {
      world.set(x, y, 7); // 烟
      return;
    }

    // 粘度：温度越低越粘，只有一定概率才移动
    // 常温下约 30% 概率移动，高温下更活跃
    const moveChance = Math.min(0.8, 0.3 + (temp - 20) * 0.005);
    if (Math.random() > moveChance) {
      world.wakeArea(x, y); // 保持活跃，下帧再试
      return;
    }

    if (y >= world.height - 1) return;

    // 1. 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 斜下（粘稠，只尝试紧邻的斜下方）
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 3. 水平流动（非常缓慢，只移动 1 格）
    for (const d of [dir, -dir]) {
      const sx = x + d;
      if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
    }

    // 4. 密度置换：蜂蜜比水重，下沉
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < Honey.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Honey);
