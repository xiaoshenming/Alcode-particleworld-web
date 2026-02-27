import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 热释电材料 —— 温度变化产生电荷的晶体材料
 * - 固体，密度 Infinity（不可移动）
 * - 温度快速变化时产生电荷：相邻导线(43)被激活为电弧(145)
 * - 比铁电材料更敏感，但居里温度更低(>250° → 陶瓷(90))
 * - 可被闪电(16)充能，短暂提升温度
 * - 淡绿色带晶体质感
 */

export const PyroelectricMaterial: MaterialDef = {
  id: 355,
  name: '热释电材料',
  category: '特殊',
  description: '温度变化产生电荷的晶体材料，比铁电材料更敏感',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 160 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 20);
      b = 170 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 145 + Math.floor(Math.random() * 15);
      g = 185 + Math.floor(Math.random() * 15);
      b = 155 + Math.floor(Math.random() * 15);
    } else {
      r = 180 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 15);
      b = 190 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超过居里温度失效
    if (temp > 250) {
      world.set(x, y, 90); // 陶瓷
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;

    // 温度偏离常温时产生电荷（比铁电材料更敏感）
    const tempDiff = Math.abs(temp - 20);
    if (tempDiff > 5) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        // 激活导线为电弧
        if (nid === 43 && Math.random() < 0.05 * Math.min(1, tempDiff / 50)) {
          world.set(nx, ny, 145);
          world.wakeArea(nx, ny);
        }
      }
    }

    // 被闪电充能
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 16 && Math.random() < 0.3) {
        world.addTemp(x, y, 30);
        world.wakeArea(x, y);
      }

      // 耐酸中等
      if (nid === 9 && Math.random() < 0.012) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.04) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }
  },
};

registerMaterial(PyroelectricMaterial);
