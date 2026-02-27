import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 沼气 —— 可燃轻质气体
 * - 气体，比空气轻，向上飘升
 * - 极易燃：遇火/火花/雷电/熔岩立即爆炸
 * - 爆炸产生火焰并向周围扩散冲击
 * - 沼泽(54)自然产生沼气
 * - 有限寿命，一段时间后自然消散
 * - 受风力影响
 * - 视觉上呈淡黄绿色半透明
 */

/** 点火源 */
const IGNITORS = new Set([6, 11, 16, 28, 55, 47, 48]); // 火、熔岩、雷电、火花、等离子体、激光、光束

export const Methane: MaterialDef = {
  id: 95,
  name: '沼气',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 淡黄绿色
      r = 150 + Math.floor(Math.random() * 30);
      g = 170 + Math.floor(Math.random() * 30);
      b = 90 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 暗绿
      r = 120 + Math.floor(Math.random() * 20);
      g = 145 + Math.floor(Math.random() * 20);
      b = 75 + Math.floor(Math.random() * 15);
    } else {
      // 淡黄高光
      r = 180 + Math.floor(Math.random() * 25);
      g = 190 + Math.floor(Math.random() * 20);
      b = 100 + Math.floor(Math.random() * 20);
    }
    // 半透明（alpha ~200）
    return (0xC8 << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.05, // 比空气轻，上浮
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃
    if (temp > 150 && Math.random() < 0.3) {
      explode(x, y, world);
      return;
    }

    // 自然消散
    if (Math.random() < 0.004) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇点火源爆炸
      if (IGNITORS.has(nid)) {
        explode(x, y, world);
        return;
      }
    }

    // 上浮
    if (y > 0 && Math.random() < 0.4) {
      if (world.isEmpty(x, y - 1)) {
        world.swap(x, y, x, y - 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y - 1);
        return;
      }

      // 密度置换（穿过比自己重的气体）
      const aboveDensity = world.getDensity(x, y - 1);
      if (aboveDensity > 0.05 && aboveDensity < 1 && Math.random() < 0.3) {
        world.swap(x, y, x, y - 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y - 1);
        return;
      }

      // 斜上飘
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.wakeArea(x, y);
        world.wakeArea(nx, y - 1);
        return;
      }
    }

    // 风力影响
    const wind = world.getWind();
    const windStr = world.getWindStrength();
    if (wind !== 0 && Math.random() < windStr * 0.5) {
      const nx = x + wind;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
        return;
      }
    }

    // 随机水平扩散
    if (Math.random() < 0.15) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

/** 沼气爆炸：产生火焰 + 冲击波 */
function explode(x: number, y: number, world: WorldAPI): void {
  world.set(x, y, 6); // 火
  world.setTemp(x, y, 200);
  world.wakeArea(x, y);

  // 小范围爆炸扩散
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 引爆相邻沼气（链式反应）
      if (nid === 95) {
        world.set(nx, ny, 6); // 火
        world.setTemp(nx, ny, 200);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 空气变火
      if (nid === 0 && Math.random() < 0.3) {
        world.set(nx, ny, 6);
        world.setTemp(nx, ny, 150);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      world.addTemp(nx, ny, 100);
      world.wakeArea(nx, ny);
    }
  }
}

registerMaterial(Methane);
