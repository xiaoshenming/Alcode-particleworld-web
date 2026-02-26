import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 电热材料 —— 通电产生热量的电阻材料
 * - 固体，密度 Infinity（不可移动）
 * - 接触电弧(145)/闪电(16) → 自身升温并加热周围
 * - 持续通电时温度可达 >800°，能熔化相邻低熔点金属
 * - 高温(>1500°) → 自身熔化为熔岩(11)
 * - 深灰色带金属光泽
 */

export const ElectrothermalMaterial: MaterialDef = {
  id: 360,
  name: '电热材料',
  category: '特殊',
  description: '通电产生热量的电阻材料，可用作加热器',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 120 + Math.floor(Math.random() * 20);
      g = 115 + Math.floor(Math.random() * 18);
      b = 110 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      r = 100 + Math.floor(Math.random() * 15);
      g = 98 + Math.floor(Math.random() * 12);
      b = 95 + Math.floor(Math.random() * 10);
    } else {
      r = 145 + Math.floor(Math.random() * 18);
      g = 140 + Math.floor(Math.random() * 15);
      b = 132 + Math.floor(Math.random() * 12);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过热熔化
    if (temp > 1500) {
      world.set(x, y, 11);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    let powered = false;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 通电升温
      if ((nid === 145 || nid === 16) && Math.random() < 0.5) {
        world.addTemp(x, y, 25);
        powered = true;
      }

      // 耐酸中等
      if (nid === 9 && Math.random() < 0.008) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }
    }

    // 通电时向周围传热
    if (powered || temp > 100) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) !== 0) {
          const nt = world.getTemp(nx, ny);
          if (temp > nt + 5) {
            const diff = (temp - nt) * 0.15;
            world.addTemp(nx, ny, diff);
            world.addTemp(x, y, -diff * 0.3);
          }
        }
      }
    }

    // 未通电时缓慢冷却
    if (!powered && temp > 20) {
      world.addTemp(x, y, -0.5);
    }
  },
};

registerMaterial(ElectrothermalMaterial);
