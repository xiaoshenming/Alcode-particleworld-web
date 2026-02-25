import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 板岩 —— 层状变质岩
 * - 固体，密度 Infinity（不可移动）
 * - 高硬度：耐酸腐蚀（仅氟化氢208可缓慢腐蚀）
 * - 高温(>1100°)碎裂为沙子(1)
 * - 导热性差：隔热效果好
 * - 深灰蓝色层状纹理
 */

export const Slate: MaterialDef = {
  id: 234,
  name: '板岩',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 深灰蓝
      r = 60 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 15);
      b = 80 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 中灰蓝
      r = 75 + Math.floor(Math.random() * 15);
      g = 80 + Math.floor(Math.random() * 15);
      b = 95 + Math.floor(Math.random() * 15);
    } else if (phase < 0.9) {
      // 暗灰
      r = 55 + Math.floor(Math.random() * 15);
      g = 58 + Math.floor(Math.random() * 12);
      b = 68 + Math.floor(Math.random() * 15);
    } else {
      // 层间亮线
      r = 90 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 20);
      b = 110 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温碎裂
    if (temp > 1100) {
      world.set(x, y, 1); // 沙子
      world.setTemp(x, y, temp * 0.5);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 仅氟化氢可腐蚀
      if (nid === 208 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 普通酸无效
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.005) {
        world.set(nx, ny, 7); // 酸蒸发
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 隔热：缓慢传导
      if (nid !== 0 && Math.random() < 0.03) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 10) {
          const diff = (nt - temp) * 0.05;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(Slate);
