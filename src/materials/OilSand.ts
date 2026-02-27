import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 焦油砂 —— 含油的沙子
 * - 粉末状固体，行为类似沙子
 * - 遇火释放油并燃烧，沙子残留
 * - 遇水缓慢分离出油（浮在水面）
 * - 高温（>100°）渗出油
 * - 比普通沙子略重（含油）
 */

/** 可点燃焦油砂的材质 */
const IGNITER = new Set([6, 11, 55, 28]); // 火、熔岩、等离子体、火花

export const OilSand: MaterialDef = {
  id: 74,
  name: '焦油砂',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深褐黑色（油浸沙）
      r = 50 + Math.floor(Math.random() * 20);
      g = 40 + Math.floor(Math.random() * 15);
      b = 25 + Math.floor(Math.random() * 10);
    } else if (phase < 0.8) {
      // 暗棕色
      r = 70 + Math.floor(Math.random() * 20);
      g = 55 + Math.floor(Math.random() * 15);
      b = 30 + Math.floor(Math.random() * 10);
    } else {
      // 油光反射
      r = 85 + Math.floor(Math.random() * 15);
      g = 65 + Math.floor(Math.random() * 15);
      b = 35 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温渗出油：焦油砂变沙子，上方空位生成油
    if (temp > 100 && Math.random() < 0.1) {
      world.set(x, y, 1); // 沙子
      // 尝试在上方释放油
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 5); // 油
        world.markUpdated(x, y - 1);
      }
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火燃烧：释放油+火，残留沙子
      if (IGNITER.has(nid) && Math.random() < 0.25) {
        world.set(x, y, 1); // 残留沙子
        // 释放火焰和烟
        if (y > 0 && world.isEmpty(x, y - 1)) {
          world.set(x, y - 1, 6); // 火
          world.markUpdated(x, y - 1);
        }
        // 侧面释放烟
        for (const [sdx, sdy] of [[-1, -1], [1, -1]] as [number, number][]) {
          const sx = x + sdx, sy = y + sdy;
          if (world.inBounds(sx, sy) && world.isEmpty(sx, sy) && Math.random() < 0.5) {
            world.set(sx, sy, 7); // 烟
            world.markUpdated(sx, sy);
          }
        }
        world.wakeArea(x, y);
        return;
      }

      // 遇水缓慢分离油
      if ((nid === 2 || nid === 24) && Math.random() < 0.01) {
        world.set(x, y, 1); // 变沙子
        world.set(nx, ny, 5); // 水变油
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        return;
      }

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.06) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    if (y >= world.height - 1) return;

    // 下落（沙子行为）
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 4.5 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下滑落
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(OilSand);
