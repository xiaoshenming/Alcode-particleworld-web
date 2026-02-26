import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光电材料 —— 光照产生电流的特殊材料
 * - 固体，密度 Infinity（不可移动）
 * - 接触激光(47)/光束(48)时激活，向邻近电线(44)传导电信号
 * - 激活时发出蓝紫色光
 * - >800° 损坏变为玻璃
 * - 深蓝色带紫色光泽
 */

export const PhotoelectricMaterial: MaterialDef = {
  id: 435,
  name: '光电材料',
  category: '特殊',
  description: '光照产生电流的材料，接触光源时激活并向电线传导信号',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 40 + Math.floor(Math.random() * 15);
      g = 35 + Math.floor(Math.random() * 12);
      b = 100 + Math.floor(Math.random() * 30);
    } else if (phase < 0.85) {
      r = 60 + Math.floor(Math.random() * 20);
      g = 30 + Math.floor(Math.random() * 10);
      b = 130 + Math.floor(Math.random() * 25);
    } else {
      // 紫色光泽
      r = 90 + Math.floor(Math.random() * 20);
      g = 40 + Math.floor(Math.random() * 15);
      b = 150 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 过热损坏
    if (temp > 800) {
      world.set(x, y, 17); // 玻璃
      world.wakeArea(x, y);
      return;
    }

    let illuminated = false;
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    // 检测是否被光照射
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 47 || nid === 48) {
        illuminated = true;
        break;
      }
    }

    if (illuminated) {
      // 被光照时，激活邻近电线
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (world.get(nx, ny) === 44) {
          world.wakeArea(nx, ny);
          world.addTemp(nx, ny, 2);
        }
      }
      // 自身微微发热
      world.addTemp(x, y, 0.5);
      world.wakeArea(x, y);
    }

    // 导热
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.08;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(PhotoelectricMaterial);
