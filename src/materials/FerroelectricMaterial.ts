import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 铁电材料 —— 具有自发极化的智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 温度变化时产生电荷：相邻导线(43)被激活为电弧(145)
 * - 居里温度 >350° → 失去铁电性，变为普通陶瓷(90)
 * - 导热(0.04)
 * - 浅黄色带陶瓷质感
 */

export const FerroelectricMaterial: MaterialDef = {
  id: 350,
  name: '铁电材料',
  category: '特殊',
  description: '具有自发极化的智能材料，温度变化时产生电荷',
  density: Infinity,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 210 + Math.floor(Math.random() * 20);
      g = 195 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      r = 190 + Math.floor(Math.random() * 15);
      g = 180 + Math.floor(Math.random() * 15);
      b = 130 + Math.floor(Math.random() * 15);
    } else {
      r = 230 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 18);
      b = 160 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 超过居里温度失去铁电性
    if (temp > 350) {
      world.set(x, y, 90); // 陶瓷
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;

    // 温度变化时产生电荷效应
    const tempDiff = Math.abs(temp - 20);
    if (tempDiff > 10) {
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        const nid = world.get(nx, ny);

        // 激活相邻导线为电弧
        if (nid === 43 && Math.random() < 0.03 * Math.min(1, tempDiff / 100)) {
          world.set(nx, ny, 145);
          world.wakeArea(nx, ny);
        }
      }
    }

    // 导热和耐酸
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid === 9 && Math.random() < 0.01) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.wakeArea(x, y);
        return;
      }

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

registerMaterial(FerroelectricMaterial);
