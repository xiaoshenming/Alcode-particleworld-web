import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 极高温热源（冰接触→直接蒸发为蒸汽） */
const VAPORIZE = new Set([11, 55]); // 熔岩、等离子体 → 蒸汽
/** 普通热源（冰接触→融化为水） */
const MELT = new Set([6, 8]); // 火、蒸汽 → 水

/**
 * 冰 —— 固体，水冻结产物
 * - 遇熔岩/等离子体 → 直接蒸发为蒸汽（剧烈高温）
 * - 遇火/蒸汽 → 融化为水
 * - 相邻水有小概率冻结为冰（扩散冻结）
 */
export const Ice: MaterialDef = {
  id: 14,
  name: '冰',
  color() {
    const r = 160 + Math.floor(Math.random() * 30);
    const g = 210 + Math.floor(Math.random() * 20);
    const b = 240 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r; // 浅蓝色
  },
  density: Infinity, // 固体不可移动
  update(x: number, y: number, world: WorldAPI) {
    // 温度高于 35° 时融化为水
    if (world.getTemp(x, y) > 35) {
      world.set(x, y, 2); // 变水
      world.setTemp(x, y, 20);
      return;
    }

    // 冰降低周围温度
    world.setTemp(x, y, Math.min(world.getTemp(x, y), -5));

    // 极高温热源：直接蒸发为蒸汽（显式4方向，无HOF）
    if (world.inBounds(x, y - 1) && VAPORIZE.has(world.get(x, y - 1))) { world.set(x, y, 8); world.wakeArea(x, y); return; }
    if (world.inBounds(x, y + 1) && VAPORIZE.has(world.get(x, y + 1))) { world.set(x, y, 8); world.wakeArea(x, y); return; }
    if (world.inBounds(x - 1, y) && VAPORIZE.has(world.get(x - 1, y))) { world.set(x, y, 8); world.wakeArea(x, y); return; }
    if (world.inBounds(x + 1, y) && VAPORIZE.has(world.get(x + 1, y))) { world.set(x, y, 8); world.wakeArea(x, y); return; }
    // 普通热源：融化为水（显式4方向，无HOF）
    if (world.inBounds(x, y - 1) && MELT.has(world.get(x, y - 1))) { world.set(x, y, 2); return; }
    if (world.inBounds(x, y + 1) && MELT.has(world.get(x, y + 1))) { world.set(x, y, 2); return; }
    if (world.inBounds(x - 1, y) && MELT.has(world.get(x - 1, y))) { world.set(x, y, 2); return; }
    if (world.inBounds(x + 1, y) && MELT.has(world.get(x + 1, y))) { world.set(x, y, 2); return; }

    // 扩散冻结（显式4方向，无HOF）：相邻水有小概率冻结为冰
    if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 2 && Math.random() < 0.005) { world.set(x, y - 1, 14); world.markUpdated(x, y - 1); }
    if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 2 && Math.random() < 0.005) { world.set(x, y + 1, 14); world.markUpdated(x, y + 1); }
    if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 2 && Math.random() < 0.005) { world.set(x - 1, y, 14); world.markUpdated(x - 1, y); }
    if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 2 && Math.random() < 0.005) { world.set(x + 1, y, 14); world.markUpdated(x + 1, y); }
  },
};

registerMaterial(Ice);
