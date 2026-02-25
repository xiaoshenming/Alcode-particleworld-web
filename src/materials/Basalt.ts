import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 岩浆岩 —— 熔岩冷却后形成的深色岩石
 * - 固体，不受重力影响
 * - 熔岩接触水/冰/雪时自然生成
 * - 极高温（>800°）时重新融化为熔岩
 * - 比普通石头更坚硬，酸液腐蚀速度更慢
 * - 视觉上呈深灰/黑色，带有细微纹理
 */

export const Basalt: MaterialDef = {
  id: 77,
  name: '岩浆岩',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深灰色
      r = 40 + Math.floor(Math.random() * 20);
      g = 42 + Math.floor(Math.random() * 18);
      b = 48 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 暗色带微红
      r = 55 + Math.floor(Math.random() * 15);
      g = 38 + Math.floor(Math.random() * 15);
      b = 40 + Math.floor(Math.random() * 15);
    } else {
      // 亮灰纹理
      r = 65 + Math.floor(Math.random() * 20);
      g = 65 + Math.floor(Math.random() * 18);
      b = 70 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity, // 固体不动
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温重新融化为熔岩
    if (temp > 800) {
      world.set(x, y, 11); // 熔岩
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居交互
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 酸液缓慢腐蚀（比石头慢）
      if (nid === 9 && Math.random() < 0.005) {
        world.set(x, y, 0);
        world.set(nx, ny, 7); // 烟
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 高温时缓慢向周围传热
    if (temp > 100) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.getTemp(nx, ny) < temp) {
          world.addTemp(nx, ny, 0.3);
          world.addTemp(x, y, -0.3);
        }
      }
    }
  },
};

registerMaterial(Basalt);
