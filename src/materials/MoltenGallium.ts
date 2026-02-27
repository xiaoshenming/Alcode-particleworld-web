import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态镓 —— 镓的熔融态
 * - 液体，密度 4.5（较重液体）
 * - 冷却 <28° → 固态镓(426)
 * - 沸点 >2204° → 蒸汽
 * - 银白色液态金属，类似水银
 * - 可以"吃掉"铝（镓脆化效应）
 */

export const MoltenGallium: MaterialDef = {
  id: 427,
  name: '液态镓',
  category: '熔融金属',
  description: '镓的液态形式，银白色液态金属，可腐蚀铝（镓脆化）',
  density: 4.5,
  color() {
    const r = 190 + Math.floor(Math.random() * 25);
    const g = 200 + Math.floor(Math.random() * 20);
    const b = 225 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 28) {
      world.set(x, y, 426);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 高温蒸发
    if (temp > 2204) {
      world.set(x, y, 8); // 蒸汽
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 镓脆化效应：腐蚀铝(153=液态铝，这里用金属10代替)
      if (nid === 10 && Math.random() < 0.03) {
        world.set(nx, ny, 0);
        world.wakeArea(nx, ny);
      }

      // 传热
      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 3) {
          const diff = (nt - temp) * 0.12;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // 重力下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      // 密度置换（比水重）
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 4.5 && belowDensity > 0 && Math.random() < 0.4) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      // 侧流
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.get(x + dir, y + 1) === 0) {
        world.swap(x, y, x + dir, y + 1);
        world.wakeArea(x + dir, y + 1);
        return;
      }
      if (world.inBounds(x - dir, y + 1) && world.get(x - dir, y + 1) === 0) {
        world.swap(x, y, x - dir, y + 1);
        world.wakeArea(x - dir, y + 1);
        return;
      }
      // 水平流动
      if (world.inBounds(x + dir, y) && world.get(x + dir, y) === 0) {
        world.swap(x, y, x + dir, y);
        world.wakeArea(x + dir, y);
      }
    }
  },
};

registerMaterial(MoltenGallium);
