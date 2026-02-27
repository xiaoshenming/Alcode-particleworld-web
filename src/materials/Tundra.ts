import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 苔原 —— 永久冻土层
 * - 粉末类，受重力影响（类似泥土）
 * - 低温环境下非常稳定
 * - 温度>10° 时融化为泥浆
 * - 接触水且低温时将水冻结为冰
 * - 表面可生长苔藓（低概率）
 * - 视觉上呈灰褐色带冰晶纹理
 */

export const Tundra: MaterialDef = {
  id: 78,
  name: '苔原',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 灰褐色冻土
      r = 100 + Math.floor(Math.random() * 20);
      g = 95 + Math.floor(Math.random() * 18);
      b = 85 + Math.floor(Math.random() * 15);
    } else if (phase < 0.7) {
      // 深灰带蓝调（冰晶）
      r = 85 + Math.floor(Math.random() * 15);
      g = 90 + Math.floor(Math.random() * 15);
      b = 105 + Math.floor(Math.random() * 20);
    } else {
      // 浅灰白（霜冻表面）
      r = 130 + Math.floor(Math.random() * 20);
      g = 135 + Math.floor(Math.random() * 18);
      b = 140 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 5, // 比泥土略重
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温融化为泥浆
    if (temp > 10) {
      world.set(x, y, 63); // 泥浆
      world.wakeArea(x, y);
      return;
    }

    // 重力下落
    if (y + 1 < world.height) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 斜下滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水且低温 → 冻结为冰
      if (nid === 2 && temp < 0 && Math.random() < 0.06) {
        world.set(nx, ny, 14); // 冰
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 表面生长苔藓（上方是空气时）
      if (dy === -1 && nid === 0 && temp > -10 && temp < 5 && Math.random() < 0.001) {
        world.set(nx, ny, 49); // 苔藓
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 低温环境下缓慢降温周围
    if (temp < 0) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.getTemp(nx, ny) > temp) {
          world.addTemp(nx, ny, -0.2);
        }
      }
    }
  },
};

registerMaterial(Tundra);
