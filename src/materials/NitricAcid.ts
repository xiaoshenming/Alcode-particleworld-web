import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 硝酸 —— 强氧化性液体
 * - 液体，密度 2.5
 * - 强氧化性：溶解金属(10)/铜(85)/锡(86)，产生烟(7)
 * - 遇有机物(木4/植物13)使其变黄（变为干沙146模拟碳化）
 * - 遇碱液(167)中和为盐水(24)
 * - 无色偏黄液体，冒黄烟
 */

/** 可被硝酸溶解的金属 */
const DISSOLVABLE_METAL = new Set([10, 85, 86]); // 金属、铜、锡

/** 有机物（变黄/碳化） */
const ORGANIC = new Set([4, 13]); // 木头、植物

export const NitricAcid: MaterialDef = {
  id: 183,
  name: '硝酸',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 无色偏黄
      r = 220 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 20);
      b = 170 + Math.floor(Math.random() * 20);
    } else if (t < 0.8) {
      // 淡黄色
      r = 230 + Math.floor(Math.random() * 15);
      g = 220 + Math.floor(Math.random() * 15);
      b = 150 + Math.floor(Math.random() * 20);
    } else {
      // 浅色高光（近透明）
      r = 240 + Math.floor(Math.random() * 10);
      g = 235 + Math.floor(Math.random() * 10);
      b = 190 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const dirs = DIRS4;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 溶解金属：产生烟
      if (DISSOLVABLE_METAL.has(nid) && Math.random() < 0.04) {
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 硝酸自身有概率消耗
        if (Math.random() < 0.4) {
          world.set(x, y, 7); // 黄烟
          world.wakeArea(x, y);
          return;
        }
        continue;
      }

      // 有机物变黄（碳化为干沙模拟）
      if (ORGANIC.has(nid) && Math.random() < 0.05) {
        world.set(nx, ny, 146); // 干沙（模拟碳化变黄）
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        if (Math.random() < 0.3) {
          world.set(x, y, 7); // 烟
          world.wakeArea(x, y);
          return;
        }
        continue;
      }

      // 遇碱液中和为盐水
      if (nid === 167 && Math.random() < 0.1) {
        world.set(x, y, 24);  // 盐水
        world.set(nx, ny, 24); // 盐水
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 冒黄烟：上方空位偶尔产生烟
      if (dy === -1 && nid === 0 && Math.random() < 0.01) {
        world.set(nx, ny, 7); // 烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // 重力下落
    if (world.inBounds(x, y + 1)) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < NitricAcid.density && belowDensity < Infinity) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下流动
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
      {
        const d = -dir;
        const sx = x + d;
        if (world.inBounds(sx, y + 1) && world.isEmpty(sx, y + 1)) {
          world.swap(x, y, sx, y + 1);
          world.markUpdated(sx, y + 1);
          world.wakeArea(sx, y + 1);
          return;
        }
      }
    }

    // 水平流动
    if (Math.random() < 0.4) {
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          world.wakeArea(sx, y);
          return;
        }
      }
      {
        const d = -dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          world.wakeArea(sx, y);
          return;
        }
      }
    }
  },
};

registerMaterial(NitricAcid);
