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
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }

    // 邻居交互（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nid = world.get(x, y - 1);
      // 上方（dy===-1）：冻结水 + 苔藓生长
      if (nid === 2 && temp < 0 && Math.random() < 0.06) { world.set(x, y - 1, 14); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
      if (nid === 0 && temp > -10 && temp < 5 && Math.random() < 0.001) { world.set(x, y - 1, 49); world.markUpdated(x, y - 1); world.wakeArea(x, y - 1); }
    }
    if (world.inBounds(x, y + 1)) {
      const nid = world.get(x, y + 1);
      if (nid === 2 && temp < 0 && Math.random() < 0.06) { world.set(x, y + 1, 14); world.markUpdated(x, y + 1); world.wakeArea(x, y + 1); }
    }
    if (world.inBounds(x - 1, y)) {
      const nid = world.get(x - 1, y);
      if (nid === 2 && temp < 0 && Math.random() < 0.06) { world.set(x - 1, y, 14); world.markUpdated(x - 1, y); world.wakeArea(x - 1, y); }
    }
    if (world.inBounds(x + 1, y)) {
      const nid = world.get(x + 1, y);
      if (nid === 2 && temp < 0 && Math.random() < 0.06) { world.set(x + 1, y, 14); world.markUpdated(x + 1, y); world.wakeArea(x + 1, y); }
    }

    // 低温环境下缓慢降温周围（4方向显式展开，无HOF）
    if (temp < 0) {
      if (world.inBounds(x, y - 1) && world.getTemp(x, y - 1) > temp) { world.addTemp(x, y - 1, -0.2); }
      if (world.inBounds(x, y + 1) && world.getTemp(x, y + 1) > temp) { world.addTemp(x, y + 1, -0.2); }
      if (world.inBounds(x - 1, y) && world.getTemp(x - 1, y) > temp) { world.addTemp(x - 1, y, -0.2); }
      if (world.inBounds(x + 1, y) && world.getTemp(x + 1, y) > temp) { world.addTemp(x + 1, y, -0.2); }
    }
  },
};

registerMaterial(Tundra);
