import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蒸汽机 —— 将水+热量转化为蒸汽的机械装置
 * - 固体，不可移动
 * - 吸收相邻的水(2)/蒸馏水(97)，在高温时转化为蒸汽(8)向上喷出
 * - 需要热源（火/熔岩/高温）才能工作
 * - 工作时产生齿轮(88)旋转效果（唤醒邻近齿轮）
 * - 视觉上呈铜色金属质感
 */

/** 水源 */
const WATER_TYPES = new Set([2, 97]); // 水、蒸馏水

/** 热源 */
const HEAT_SOURCES = new Set([6, 11, 28, 55, 94]); // 火、熔岩、火花、等离子体、铝热剂

export const SteamEngine: MaterialDef = {
  id: 102,
  name: '蒸汽机',
  color() {
    const t = Math.random();
    let r: number, g: number, b: number;
    if (t < 0.5) {
      // 铜色主体
      r = 160 + Math.floor(Math.random() * 30);
      g = 100 + Math.floor(Math.random() * 20);
      b = 50 + Math.floor(Math.random() * 15);
    } else if (t < 0.8) {
      // 深铜色
      r = 130 + Math.floor(Math.random() * 25);
      g = 75 + Math.floor(Math.random() * 20);
      b = 35 + Math.floor(Math.random() * 15);
    } else {
      // 金属高光
      r = 190 + Math.floor(Math.random() * 30);
      g = 140 + Math.floor(Math.random() * 25);
      b = 80 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    let hasHeat = temp > 80;
    let waterPos: [number, number] | null = null;

    // 扫描邻居（4方向显式展开，无HOF）
    if (world.inBounds(x, y - 1)) {
      const nx = x, ny = y - 1; const nid = world.get(nx, ny);
      if (HEAT_SOURCES.has(nid)) { hasHeat = true; world.addTemp(x, y, 2); }
      if (WATER_TYPES.has(nid) && !waterPos) { waterPos = [nx, ny]; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x, y + 1)) {
      const nx = x, ny = y + 1; const nid = world.get(nx, ny);
      if (HEAT_SOURCES.has(nid)) { hasHeat = true; world.addTemp(x, y, 2); }
      if (WATER_TYPES.has(nid) && !waterPos) { waterPos = [nx, ny]; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x - 1, y)) {
      const nx = x - 1, ny = y; const nid = world.get(nx, ny);
      if (HEAT_SOURCES.has(nid)) { hasHeat = true; world.addTemp(x, y, 2); }
      if (WATER_TYPES.has(nid) && !waterPos) { waterPos = [nx, ny]; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }
    if (world.inBounds(x + 1, y)) {
      const nx = x + 1, ny = y; const nid = world.get(nx, ny);
      if (HEAT_SOURCES.has(nid)) { hasHeat = true; world.addTemp(x, y, 2); }
      if (WATER_TYPES.has(nid) && !waterPos) { waterPos = [nx, ny]; }
      if (nid === 9 && Math.random() < 0.02) { world.set(x, y, 0); world.wakeArea(x, y); return; }
    }

    // 有热量+有水 → 产生蒸汽
    if (hasHeat && waterPos) {
      // 消耗水
      world.set(waterPos[0], waterPos[1], 0);
      world.wakeArea(waterPos[0], waterPos[1]);

      // 在上方喷出蒸汽
      for (let dy = -1; dy >= -3; dy--) {
        const sy = y + dy;
        if (world.inBounds(x, sy) && world.isEmpty(x, sy)) {
          world.set(x, sy, 8); // 蒸汽
          world.markUpdated(x, sy);
          world.wakeArea(x, sy);
          break;
        }
      }

      // 降温消耗
      world.addTemp(x, y, -5);

      // 唤醒邻近齿轮（4方向显式展开，无HOF）
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 88) { world.wakeArea(x, y - 1); }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 88) { world.wakeArea(x, y + 1); }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 88) { world.wakeArea(x - 1, y); }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 88) { world.wakeArea(x + 1, y); }
    }

    // 自身散热
    if (temp > 20 && Math.random() < 0.1) {
      world.addTemp(x, y, -1);
    }
  },
};

registerMaterial(SteamEngine);
