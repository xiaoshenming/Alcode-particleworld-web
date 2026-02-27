import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光伏材料 —— 将光能转化为热能的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 接触光源（激光47/光束48/闪电16）→ 自身升温+30
 * - 接触火(6) → 升温+15
 * - 高温(>600°) → 分解为烟(7)
 * - 持续缓慢散热(-0.5/帧)
 * - 邻居有水(2)时加速散热并加热水
 * - 深蓝色带紫调，受光后偏亮
 */

export const PhotovoltaicMaterial: MaterialDef = {
  id: 310,
  name: '光伏材料',
  category: '特殊',
  description: '将光能转化为热能的智能材料',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深蓝紫
      r = 25 + Math.floor(Math.random() * 15);
      g = 35 + Math.floor(Math.random() * 20);
      b = 100 + Math.floor(Math.random() * 30);
    } else if (phase < 0.8) {
      // 暗蓝
      r = 15 + Math.floor(Math.random() * 10);
      g = 25 + Math.floor(Math.random() * 15);
      b = 75 + Math.floor(Math.random() * 25);
    } else {
      // 反光亮点
      r = 60 + Math.floor(Math.random() * 20);
      g = 80 + Math.floor(Math.random() * 25);
      b = 160 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解
    if (temp > 600) {
      world.set(x, y, 7);
      world.wakeArea(x, y);
      return;
    }

    // 缓慢散热
    if (temp > 20) {
      world.addTemp(x, y, -0.5);
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 光源 → 升温
      if ((nid === 47 || nid === 48 || nid === 16) && Math.random() < 0.8) {
        world.addTemp(x, y, 30);
        world.wakeArea(x, y);
      }

      // 火 → 升温
      if (nid === 6 && Math.random() < 0.5) {
        world.addTemp(x, y, 15);
        world.wakeArea(x, y);
      }

      // 水冷却：加速散热并加热水
      if (nid === 2 && temp > 30) {
        const transfer = Math.min(15, (temp - 20) * 0.1);
        world.addTemp(x, y, -transfer);
        world.addTemp(nx, ny, transfer * 0.8);
      }

      // 普通导热
      if (nid !== 0 && Math.random() < 0.06) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.07;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(PhotovoltaicMaterial);
