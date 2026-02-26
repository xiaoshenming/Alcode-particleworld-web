import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 声光材料 —— 利用声波调制光的传播
 * - 轻质固体，密度 1.5（受重力下落）
 * - 接触激光(47)时产生彩色火花（声光效应）
 * - 接触电线(44)/电弧(145)时发光（产生火花）
 * - 接触火(6)时缓慢燃烧
 * - 透明蓝紫色
 */

export const AcoustoOpticMaterial: MaterialDef = {
  id: 405,
  name: '声光材料',
  category: '特殊',
  description: '利用声波调制光传播的智能材料，接触激光产生彩色衍射效果',
  density: 1.5,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 蓝紫色
      r = 100 + Math.floor(Math.random() * 25);
      g = 80 + Math.floor(Math.random() * 20);
      b = 180 + Math.floor(Math.random() * 25);
    } else if (phase < 0.8) {
      // 暗紫蓝
      r = 80 + Math.floor(Math.random() * 18);
      g = 60 + Math.floor(Math.random() * 15);
      b = 155 + Math.floor(Math.random() * 20);
    } else {
      // 亮蓝紫高光
      r = 130 + Math.floor(Math.random() * 20);
      g = 110 + Math.floor(Math.random() * 18);
      b = 210 + Math.floor(Math.random() * 20);
    }
    return (0xDD << 24) | (b << 16) | (g << 8) | r; // 微透明
  },
  update(x: number, y: number, world: WorldAPI) {
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触火缓慢燃烧
      if (nid === 6 && Math.random() < 0.04) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }

      // 接触激光产生彩色火花（声光效应）
      if (nid === 47 && Math.random() < 0.12) {
        for (const [dx2, dy2] of dirs) {
          const fx = x + dx2, fy = y + dy2;
          if (world.inBounds(fx, fy) && world.isEmpty(fx, fy)) {
            world.set(fx, fy, 28); // 火花
            world.wakeArea(fx, fy);
            break;
          }
        }
        world.wakeArea(x, y);
        return;
      }

      // 接触电线/电弧时发光
      if ((nid === 44 || nid === 145) && Math.random() < 0.08) {
        for (const [dx2, dy2] of dirs) {
          const fx = x + dx2, fy = y + dy2;
          if (world.inBounds(fx, fy) && world.isEmpty(fx, fy)) {
            world.set(fx, fy, 28); // 火花
            world.wakeArea(fx, fy);
            break;
          }
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
      if (bDensity !== Infinity && bDensity < 1.5) {
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

registerMaterial(AcoustoOpticMaterial);
