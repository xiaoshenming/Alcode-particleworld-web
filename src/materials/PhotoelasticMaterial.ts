import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光弹性材料 —— 受力时改变光学性质的透明材料
 * - 轻质固体，密度 1.3（受重力下落）
 * - 受压时颜色变化（利用年龄系统模拟应力积累）
 * - 接触火(6)时燃烧变为烟(7)
 * - 弹性：被挤压时有概率和邻居交换位置
 * - 透明带彩虹色应力条纹
 */

export const PhotoelasticMaterial: MaterialDef = {
  id: 395,
  name: '光弹性材料',
  category: '特殊',
  description: '受力时产生彩虹色应力条纹的透明材料，用于应力分析和光学传感',
  density: 1.3,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.3) {
      // 透明蓝
      r = 140 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 20);
      b = 220 + Math.floor(Math.random() * 20);
    } else if (phase < 0.5) {
      // 透明绿
      r = 140 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 170 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 透明紫
      r = 190 + Math.floor(Math.random() * 20);
      g = 140 + Math.floor(Math.random() * 20);
      b = 220 + Math.floor(Math.random() * 20);
    } else {
      // 透明黄
      r = 220 + Math.floor(Math.random() * 20);
      g = 210 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 20);
    }
    return (0xDD << 24) | (b << 16) | (g << 8) | r; // 半透明
  },
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;
    let neighborCount = 0;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0) neighborCount++;

      // 接触火燃烧变为烟
      if (nid === 6 && Math.random() < 0.08) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 弹性：被挤压时和非固体邻居交换位置
      if (nid !== 0 && nid !== 395 && Math.random() < 0.015) {
        const nDensity = world.getDensity(nx, ny);
        if (nDensity !== Infinity && nDensity > 0) {
          world.swap(x, y, nx, ny);
          world.markUpdated(nx, ny);
          world.wakeArea(x, y);
          return;
        }
      }
    }

    // 受压时刷新颜色（应力条纹效果）
    if (neighborCount >= 3 && Math.random() < 0.1) {
      world.set(x, y, 395); // 刷新颜色产生彩虹条纹
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
      if (bDensity !== Infinity && bDensity < 1.3) {
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

registerMaterial(PhotoelasticMaterial);
