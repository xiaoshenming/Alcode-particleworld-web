import { DIRS4, DIRS_DIAG } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 冻土 —— 永久冻结的土壤
 * - 固体，密度 Infinity（不可移动）
 * - 高温(>30°)缓慢融化为泥土(20)
 * - 冷冻周围：降低邻居温度
 * - 遇水(2)使水结冰(14)
 * - 深棕色带冰霜纹理（棕色+白色斑点）
 */

export const Permafrost: MaterialDef = {
  id: 190,
  name: '冻土',
  color() {
    // 深棕色带冰霜纹理
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深棕色冻土
      r = 75 + Math.floor(Math.random() * 20);
      g = 55 + Math.floor(Math.random() * 15);
      b = 40 + Math.floor(Math.random() * 12);
    } else if (phase < 0.8) {
      // 灰棕色
      r = 90 + Math.floor(Math.random() * 15);
      g = 75 + Math.floor(Math.random() * 12);
      b = 65 + Math.floor(Math.random() * 10);
    } else {
      // 白色冰霜斑点
      r = 200 + Math.floor(Math.random() * 40);
      g = 210 + Math.floor(Math.random() * 35);
      b = 220 + Math.floor(Math.random() * 30);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温缓慢融化为泥土
    if (temp > 30 && Math.random() < 0.02) {
      world.set(x, y, 20); // 泥土
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 维持低温
    if (temp > -10) {
      world.setTemp(x, y, Math.max(temp - 1, -15));
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水使水结冰
      if (nid === 2 && Math.random() < 0.04) {
        world.set(nx, ny, 14); // 冰
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        continue;
      }

      // 冷冻周围：降低邻居温度
      const nTemp = world.getTemp(nx, ny);
      if (nTemp > -10) {
        world.addTemp(nx, ny, -0.5);
      }
    }

    // 对角线也有冷冻效果（弱）
    const diags = DIRS_DIAG;
    for (const [dx, dy] of diags) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nTemp = world.getTemp(nx, ny);
      if (nTemp > -5) {
        world.addTemp(nx, ny, -0.2);
      }
    }
  },
};

registerMaterial(Permafrost);
