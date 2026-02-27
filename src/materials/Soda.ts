import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 苏打 —— 碳酸钠粉末
 * - 粉末状固体，类似沙子的运动
 * - 遇酸液(9)剧烈反应：产生泡泡(73) + 盐(23)
 * - 遇水(2)/蒸馏水(97)溶解，产生碱性溶液（变成盐水近似）
 * - 遇熔岩(11)熔化为液态玻璃(92)（苏打是玻璃原料）
 * - 视觉上呈白色粉末
 */

/** 酸性材质 */
const ACIDS = new Set([9]); // 酸液

/** 水性材质 */
const WATERS = new Set([2, 97]); // 水、蒸馏水

export const Soda: MaterialDef = {
  id: 99,
  name: '苏打',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.6) {
      // 白色粉末
      r = 235 + Math.floor(Math.random() * 20);
      g = 235 + Math.floor(Math.random() * 20);
      b = 240 + Math.floor(Math.random() * 15);
    } else if (t < 0.85) {
      // 微黄白
      r = 240 + Math.floor(Math.random() * 15);
      g = 235 + Math.floor(Math.random() * 15);
      b = 220 + Math.floor(Math.random() * 15);
    } else {
      // 灰白
      r = 215 + Math.floor(Math.random() * 20);
      g = 215 + Math.floor(Math.random() * 20);
      b = 220 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.8, // 粉末，比水重
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解为烟
    if (temp > 200 && Math.random() < 0.05) {
      world.set(x, y, 7); // 烟
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸剧烈反应：产生泡泡 + 盐
      if (ACIDS.has(nid) && Math.random() < 0.3) {
        world.set(x, y, 73); // 泡泡
        world.set(nx, ny, 23); // 盐
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇水溶解为盐水
      if (WATERS.has(nid) && Math.random() < 0.06) {
        world.set(x, y, 24); // 盐水（近似碱性溶液）
        world.set(nx, ny, 0);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇熔岩熔化为液态玻璃
      if (nid === 11 && Math.random() < 0.04) {
        world.set(x, y, 92); // 液态玻璃
        world.wakeArea(x, y);
        return;
      }
    }

    if (y >= world.height - 1) return;

    // 下落（粉末运动）
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      world.wakeArea(x, y);
      world.wakeArea(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity < Soda.density && belowDensity < Infinity && belowDensity > 0) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      world.wakeArea(x, y);
      world.wakeArea(x, y + 1);
      return;
    }

    // 斜下滑落
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(Soda);
