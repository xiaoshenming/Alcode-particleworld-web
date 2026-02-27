import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铋 —— 熔融铋金属
 * - 液体，密度 8.0（很重）
 * - 低温(<200°)凝固为铋(181)
 * - 发光效果：橙红色带粉色光泽
 * - 标准液体流动逻辑
 */

export const MoltenBismuth: MaterialDef = {
  id: 182,
  name: '液态铋',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.4) {
      // 橙红色
      r = 240 + Math.floor(Math.random() * 15);
      g = 100 + Math.floor(Math.random() * 30);
      b = 50 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 粉色光泽
      r = 235 + Math.floor(Math.random() * 20);
      g = 80 + Math.floor(Math.random() * 25);
      b = 100 + Math.floor(Math.random() * 40);
    } else {
      // 亮橙高光
      r = 250;
      g = 130 + Math.floor(Math.random() * 30);
      b = 60 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 8.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低温凝固为铋晶体
    if (temp < 200) {
      if (Math.random() < 0.05) {
        world.set(x, y, 181); // 铋
        world.wakeArea(x, y);
        return;
      }
    }

    // 刷新颜色（发光闪烁）
    world.set(x, y, 182);

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 导热：向邻居传热
      if (nid !== 0 && Math.random() < 0.15) {
        const nTemp = world.getTemp(nx, ny);
        if (nTemp < temp - 5) {
          world.addTemp(x, y, -2);
          world.addTemp(nx, ny, 2);
        }
      }

      // 遇水产生蒸汽
      if (nid === 2 && Math.random() < 0.1) {
        world.set(nx, ny, 8); // 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5) && Math.random() < 0.02) {
        world.set(nx, ny, 6); // 火
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 散热
    if (Math.random() < 0.02) {
      world.addTemp(x, y, -1);
    }

    // 液体流动：重力下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < this.density && belowDensity < Infinity) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下流动
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
    }

    // 水平流动（缓慢，重金属液体）
    if (Math.random() < 0.25) {
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          world.wakeArea(sx, y);
          return;
        }
      }
      {
        const d = -dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          world.wakeArea(sx, y);
          return;
        }
      }
    }
  },
};

registerMaterial(MoltenBismuth);
