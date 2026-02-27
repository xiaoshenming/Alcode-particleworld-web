import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 铬 —— 银白色高硬度金属
 * - 固体，密度 Infinity（不可移动）
 * - 极耐腐蚀：大多数酸无效，仅王水(硝酸+盐酸)缓慢腐蚀
 * - 高温(>1907°)熔化为液态铬(207)
 * - 表面有镜面光泽
 */

const ACIDS = new Set([9, 159, 173, 183]); // 酸液、磷酸、硫酸、硝酸

export const Chromium: MaterialDef = {
  id: 206,
  name: '铬',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白色基底
      const base = 180 + Math.floor(Math.random() * 30);
      r = base;
      g = base + 3;
      b = base + 8;
    } else if (phase < 0.85) {
      // 镜面高光
      const base = 210 + Math.floor(Math.random() * 40);
      r = base;
      g = base + 2;
      b = base + 5;
    } else {
      // 微蓝色调
      const base = 160 + Math.floor(Math.random() * 25);
      r = base - 5;
      g = base;
      b = base + 15;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超高温熔化
    if (temp > 1907) {
      world.set(x, y, 207); // 液态铬
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

      // 仅硝酸+硫酸同时存在时才极缓慢腐蚀（简化：硝酸缓慢腐蚀）
      if (nid === 183 && Math.random() < 0.003) {
        world.set(nx, ny, 7); // 酸蒸发为烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 其他酸完全无效，酸自身缓慢消耗
      if (ACIDS.has(nid) && nid !== 183 && Math.random() < 0.008) {
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(Chromium);
