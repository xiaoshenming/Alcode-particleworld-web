import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 花岗岩 —— 深成火成岩
 * - 固体，密度 Infinity（不可移动）
 * - 极高硬度：耐大多数酸，仅氟化氢(208)可极缓慢腐蚀
 * - 高温(>1250°)熔化为熔岩(11)
 * - 导热性中等
 * - 灰白色带黑色/粉色斑点
 */

export const Granite: MaterialDef = {
  id: 249,
  name: '花岗岩',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.35) {
      // 灰白色基底
      const base = 170 + Math.floor(Math.random() * 25);
      r = base;
      g = base - 2;
      b = base - 5;
    } else if (phase < 0.55) {
      // 黑色斑点（云母）
      const base = 40 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 2;
      b = base + 3;
    } else if (phase < 0.75) {
      // 粉色斑点（长石）
      r = 190 + Math.floor(Math.random() * 30);
      g = 150 + Math.floor(Math.random() * 20);
      b = 150 + Math.floor(Math.random() * 20);
    } else {
      // 浅灰
      const base = 155 + Math.floor(Math.random() * 20);
      r = base + 5;
      g = base;
      b = base - 3;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为熔岩
    if (temp > 1250) {
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

      // 仅氟化氢可极缓慢腐蚀
      if (nid === 208 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 普通酸无效
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.003) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 中等导热
      if (nid !== 0 && Math.random() < 0.08) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 8) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Granite);
