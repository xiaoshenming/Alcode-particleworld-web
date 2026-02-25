import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 砂岩 —— 沉积岩
 * - 固体，密度 Infinity（不可移动）
 * - 中等硬度：酸(9)可缓慢腐蚀
 * - 高温(>800°)碎裂为沙子(1)
 * - 吸水：接触水(2)有小概率吸收（水消失）
 * - 黄褐色砂质纹理
 */

export const Sandstone: MaterialDef = {
  id: 244,
  name: '砂岩',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 黄褐色
      r = 195 + Math.floor(Math.random() * 25);
      g = 165 + Math.floor(Math.random() * 20);
      b = 110 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 浅黄
      r = 210 + Math.floor(Math.random() * 20);
      g = 185 + Math.floor(Math.random() * 20);
      b = 130 + Math.floor(Math.random() * 20);
    } else if (phase < 0.9) {
      // 深褐
      r = 170 + Math.floor(Math.random() * 20);
      g = 140 + Math.floor(Math.random() * 15);
      b = 90 + Math.floor(Math.random() * 15);
    } else {
      // 砂粒亮点
      r = 225 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 20);
      b = 155 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温碎裂为沙子
    if (temp > 800) {
      world.set(x, y, 1); // 沙子
      world.setTemp(x, y, temp * 0.4);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸腐蚀
      if ((nid === 9 || nid === 173 || nid === 183) && Math.random() < 0.02) {
        world.set(x, y, 1); // 碎裂为沙子
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 氟化氢快速腐蚀
      if (nid === 208 && Math.random() < 0.04) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 吸水
      if (nid === 2 && Math.random() < 0.008) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(Sandstone);
