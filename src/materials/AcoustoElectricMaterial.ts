import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声电材料 —— 将声波（振动/热脉冲）转换为电能的材料
 * - 轻质固体，密度 1.6（受重力下落）
 * - 温度变化时向周围电线(44)传递电弧(145)
 * - 接触火(6)时缓慢燃烧
 * - 深蓝色带金属光泽
 */

export const AcoustoElectricMaterial: MaterialDef = {
  id: 410,
  name: '声电材料',
  category: '特殊',
  description: '将声波振动转换为电能的智能材料，温度变化时产生电弧',
  density: 1.6,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深蓝色
      r = 50 + Math.floor(Math.random() * 20);
      g = 70 + Math.floor(Math.random() * 20);
      b = 160 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 暗蓝
      r = 35 + Math.floor(Math.random() * 15);
      g = 55 + Math.floor(Math.random() * 15);
      b = 135 + Math.floor(Math.random() * 20);
    } else {
      // 亮蓝金属光泽
      r = 75 + Math.floor(Math.random() * 20);
      g = 100 + Math.floor(Math.random() * 18);
      b = 190 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    const dirs = DIRS4;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火缓慢燃烧
      if (nid === 6 && Math.random() < 0.04) {
        world.set(x, y, 7);
        world.wakeArea(x, y);
        return;
      }

      // 温度较高时，接触电线产生电弧（声电效应）
      if (nid === 44 && temp > 50 && Math.random() < 0.1) {
        for (const [dx2, dy2] of dirs) {
          const ex = x + dx2, ey = y + dy2;
          if (world.inBounds(ex, ey) && world.isEmpty(ex, ey)) {
            world.set(ex, ey, 145); // 电弧
            world.wakeArea(ex, ey);
            break;
          }
        }
        // 消耗热量
        world.addTemp(x, y, -30);
        world.wakeArea(x, y);
        return;
      }

      // 导热
      if (nid !== 0 && Math.random() < 0.05) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const diff = (nt - temp) * 0.1;
          world.addTemp(x, y, diff);
          world.addTemp(nx, ny, -diff);
        }
      }
    }

    // === 轻固体运动（受重力下落） ===
    if (y < world.height - 1) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      const bDensity = world.getDensity(x, y + 1);
      if (bDensity !== Infinity && bDensity < 1.6) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下滑落
    if (y < world.height - 1 && Math.random() < 0.5) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }
  },
};

registerMaterial(AcoustoElectricMaterial);
