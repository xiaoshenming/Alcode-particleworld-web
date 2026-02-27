import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 碱液 —— 腐蚀性液体
 * - 腐蚀有机物：溶解木头(4)/植物(13)/藤蔓(57)/苔藓(49)
 * - 遇酸(9)中和反应：双方都变为盐水(24)
 * - 遇油(5)产生泡沫(51)（皂化反应）
 * - 黄绿色液体
 */

/** 可被碱液溶解的有机材质 */
const ORGANIC = new Set([4, 13, 57, 49]); // 木头、植物、藤蔓、苔藓

export const Lye: MaterialDef = {
  id: 167,
  name: '碱液',
  color() {
    const r = 140 + Math.floor(Math.random() * 20);
    const g = 180 + Math.floor(Math.random() * 30);
    const b = 40 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 黄绿色
  },
  density: 2.2,
  update(x: number, y: number, world: WorldAPI) {
    // 1. 化学反应检查
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸中和：双方都变为盐水
      if (nid === 9) {
        world.set(x, y, 24);  // 碱液→盐水
        world.set(nx, ny, 24); // 酸液→盐水
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇油皂化：油变泡沫
      if (nid === 5 && Math.random() < 0.05) {
        world.set(nx, ny, 51); // 油→泡沫
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 碱液自身有概率消耗
        if (Math.random() < 0.3) {
          world.set(x, y, 0);
          return;
        }
      }

      // 腐蚀有机物
      if (ORGANIC.has(nid) && Math.random() < 0.04) {
        world.set(nx, ny, 0); // 溶解目标
        world.wakeArea(nx, ny);
        // 碱液自身 40% 概率消耗
        if (Math.random() < 0.4) {
          world.set(x, y, 7); // 产生烟
          return;
        }
      }
    }

    if (y >= world.height - 1) return;

    // 2. 液体流动：下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 3. 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < Lye.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 4. 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 5. 水平扩散
    const spread = 2 + Math.floor(Math.random() * 2);
    for (const d of [dir, -dir]) {
      for (let i = 1; i <= spread; i++) {
        const sx = x + d * i;
        if (!world.inBounds(sx, y)) break;
        if (world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
        if (!world.isEmpty(sx, y)) break;
      }
    }
  },
};

registerMaterial(Lye);
