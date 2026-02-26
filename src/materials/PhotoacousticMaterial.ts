import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 光声材料 —— 吸收光能产生声波（热脉冲）的材料
 * - 轻质固体，密度 1.4（受重力下落）
 * - 接触激光(47)/火花(28)时向周围释放热脉冲（概率0.1）
 * - 接触火(6)时燃烧变为烟(7)
 * - 深绿色带金属光泽
 */

export const PhotoacousticMaterial: MaterialDef = {
  id: 400,
  name: '光声材料',
  category: '特殊',
  description: '吸收光能后产生热脉冲的智能材料，用于医学成像和无损检测',
  density: 1.4,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深绿色
      r = 50 + Math.floor(Math.random() * 20);
      g = 130 + Math.floor(Math.random() * 25);
      b = 70 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗绿
      r = 35 + Math.floor(Math.random() * 15);
      g = 105 + Math.floor(Math.random() * 18);
      b = 55 + Math.floor(Math.random() * 15);
    } else {
      // 亮绿金属光泽
      r = 75 + Math.floor(Math.random() * 20);
      g = 160 + Math.floor(Math.random() * 20);
      b = 90 + Math.floor(Math.random() * 18);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火燃烧变为烟
      if (nid === 6 && Math.random() < 0.08) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 接触激光/火花时释放热脉冲（光声效应）
      if ((nid === 47 || nid === 28) && Math.random() < 0.1) {
        // 向四周释放热量
        for (const [hx, hy] of dirs) {
          const tx = x + hx, ty = y + hy;
          if (world.inBounds(tx, ty)) {
            world.addTemp(tx, ty, 40);
            world.wakeArea(tx, ty);
          }
        }
        world.addTemp(x, y, 20);
        world.wakeArea(x, y);
        return;
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
      if (bDensity !== Infinity && bDensity < 1.4) {
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

registerMaterial(PhotoacousticMaterial);
