import { DIRS4, DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 介电弹性体 —— 智能弹性材料
 * - 轻质固体，密度 1.2（受重力下落）
 * - 接触电线(44)/激光(47)时向随机方向弹射（电致变形，概率0.08）
 * - 接触火(6)时燃烧变为烟(7)
 * - 弹性：被挤压时有概率和邻居交换位置
 * - 半透明蓝紫色
 */

export const DielectricElastomer: MaterialDef = {
  id: 390,
  name: '介电弹性体',
  category: '特殊',
  description: '在电场下可大幅变形的智能材料，用于人工肌肉和软体机器人',
  density: 1.2,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 蓝紫色
      r = 120 + Math.floor(Math.random() * 20);
      g = 90 + Math.floor(Math.random() * 20);
      b = 200 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 暗蓝紫
      r = 100 + Math.floor(Math.random() * 15);
      g = 75 + Math.floor(Math.random() * 15);
      b = 175 + Math.floor(Math.random() * 20);
    } else {
      // 亮蓝紫高光（半透明感）
      r = 145 + Math.floor(Math.random() * 18);
      g = 115 + Math.floor(Math.random() * 18);
      b = 225 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火燃烧变为烟
      if (nid === 6 && Math.random() < 0.12) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 接触电线/激光时弹射（电致变形）
      if ((nid === 44 || nid === 47) && Math.random() < 0.08) {
        // 向随机方向弹射（随机起始索引循环，避免每帧数组分配）
        const start = Math.floor(Math.random() * DIRS8.length);
        for (let i = 0; i < DIRS8.length; i++) {
          const [bx, by] = DIRS8[(start + i) % DIRS8.length];
          const tx = x + bx, ty = y + by;
          if (world.inBounds(tx, ty) && world.isEmpty(tx, ty)) {
            world.swap(x, y, tx, ty);
            world.markUpdated(tx, ty);
            world.wakeArea(tx, ty);
            return;
          }
        }
      }

      // 弹性：被挤压时和非固体邻居交换位置
      if (nid !== 0 && nid !== 390 && Math.random() < 0.02) {
        const nDensity = world.getDensity(nx, ny);
        if (nDensity !== Infinity && nDensity > 0) {
          world.swap(x, y, nx, ny);
          world.markUpdated(nx, ny);
          world.wakeArea(x, y);
          return;
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
      if (below !== 0) {
        const bDensity = world.getDensity(x, y + 1);
        if (bDensity !== Infinity && bDensity < 1.2) {
          world.swap(x, y, x, y + 1);
          world.markUpdated(x, y + 1);
          return;
        }
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

registerMaterial(DielectricElastomer);
