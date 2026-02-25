import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 珍珠母 —— 贝壳内层的虹彩材料
 * - 固体，不可移动
 * - 遇水(2)/盐水(24)表面产生虹彩光泽（视觉效果）
 * - 遇酸液(9)缓慢溶解产生泡泡(73)
 * - 高温(>500)碎裂为沙子(1)
 * - 珊瑚(64)附近有概率自然生成
 * - 视觉上呈白色带彩虹光泽
 */

export const Nacre: MaterialDef = {
  id: 126,
  name: '珍珠母',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.3) {
      // 珍珠白
      r = 235 + Math.floor(Math.random() * 15);
      g = 228 + Math.floor(Math.random() * 15);
      b = 220 + Math.floor(Math.random() * 15);
    } else if (t < 0.5) {
      // 粉色虹彩
      r = 230 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 20);
      b = 210 + Math.floor(Math.random() * 20);
    } else if (t < 0.7) {
      // 蓝色虹彩
      r = 200 + Math.floor(Math.random() * 15);
      g = 215 + Math.floor(Math.random() * 20);
      b = 235 + Math.floor(Math.random() * 15);
    } else if (t < 0.85) {
      // 绿色虹彩
      r = 200 + Math.floor(Math.random() * 15);
      g = 230 + Math.floor(Math.random() * 15);
      b = 210 + Math.floor(Math.random() * 15);
    } else {
      // 金色虹彩
      r = 240 + Math.floor(Math.random() * 10);
      g = 225 + Math.floor(Math.random() * 15);
      b = 195 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温碎裂
    if (temp > 500) {
      world.set(x, y, 1); // 沙子
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸液溶解产生泡泡
      if (nid === 9 && Math.random() < 0.03) {
        world.set(nx, ny, 73); // 泡泡
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        if (Math.random() < 0.3) {
          world.set(x, y, 0);
          world.wakeArea(x, y);
          return;
        }
      }

      // 遇熔岩碎裂
      if (nid === 11 && Math.random() < 0.08) {
        world.set(x, y, 1);
        world.wakeArea(x, y);
        return;
      }
    }

    // 自然散热
    if (temp > 20 && Math.random() < 0.03) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(Nacre);
