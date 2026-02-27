import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 银 —— 贵金属，最佳导电/导热体
 * - 固体，密度 Infinity（不可移动）
 * - 熔点 962°C → 变为液态银(247)
 * - 最佳导热：热传导效率极高
 * - 最佳导电：增强邻近电线(44)效果
 * - 耐腐蚀：仅硝酸(183)可溶解
 * - 遇硫磺(66)表面变黑（生成铁锈72代替）
 * - 亮银白色金属光泽
 */

export const Silver: MaterialDef = {
  id: 246,
  name: '银',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 亮银白
      const base = 200 + Math.floor(Math.random() * 20);
      r = base;
      g = base + 3;
      b = base + 8;
    } else if (phase < 0.7) {
      // 银灰
      const base = 180 + Math.floor(Math.random() * 15);
      r = base;
      g = base + 2;
      b = base + 6;
    } else {
      // 高光闪烁
      const base = 225 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 2;
      b = Math.min(255, base + 5);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 熔化
    if (temp > 962) {
      world.set(x, y, 247); // 液态银
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

      // 硝酸溶解
      if (nid === 183 && Math.random() < 0.02) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 遇硫磺变黑
      if (nid === 66 && Math.random() < 0.01) {
        world.set(x, y, 72); // 表面氧化（铁锈代替）
        world.wakeArea(x, y);
        return;
      }

      // 超导热：极快均温
      if (nid !== 0 && Math.random() < 0.3) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 2) {
          const avg = (temp + nt) / 2;
          world.setTemp(x, y, avg);
          world.setTemp(nx, ny, avg);
        }
      }

      // 增强电线
      if (nid === 44) {
        world.addTemp(nx, ny, 3);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(Silver);
