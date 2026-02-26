import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 点火源 */
const IGNITION = new Set([6, 11]); // 火、熔岩

/**
 * 氘气 —— 重氢同位素气体，可用于核聚变
 * - 气体，密度 -0.25（比空气轻，快速上升）
 * - 极淡蓝色，半透明
 * - 缓慢消散：概率 0.001 变为空气
 * - 极高温(>5000°)聚变：变为火并释放大量热量
 * - 可燃：接触火/熔岩概率 0.05 点燃
 * - 气体运动：上升、横向扩散、偶尔下沉
 */
export const Deuterium: MaterialDef = {
  id: 298,
  name: '氘气',
  category: '气体',
  description: '重氢同位素气体，可用于核聚变',
  color() {
    const r = 180 + Math.floor(Math.random() * 30);
    const g = 200 + Math.floor(Math.random() * 25);
    const b = 240 + Math.floor(Math.random() * 15);
    const a = 0x30 + Math.floor(Math.random() * 0x21); // 0x30~0x50
    return (a << 24) | (b << 16) | (g << 8) | r;
  },
  density: -0.25,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温聚变：>5000° 时触发核聚变
    if (temp > 5000) {
      world.set(x, y, 0); // 自身变为空气
      world.wakeArea(x, y);
      // 向周围释放大量热量
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (!world.inBounds(nx, ny)) continue;
          world.addTemp(nx, ny, 500);
          world.wakeArea(nx, ny);
          // 中心区域产生火焰
          if (dx * dx + dy * dy <= 2) {
            const nid = world.get(nx, ny);
            if (nid === 0 || nid === 298) {
              world.set(nx, ny, 6); // 火
              world.markUpdated(nx, ny);
            }
          }
        }
      }
      return;
    }

    // 可燃：接触火/熔岩概率 0.05 点燃
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (IGNITION.has(world.get(nx, ny)) && Math.random() < 0.05) {
          world.set(x, y, 6); // 变为火
          world.markUpdated(x, y);
          world.wakeArea(x, y);
          return;
        }
      }
    }

    // 缓慢消散
    if (Math.random() < 0.001) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // === 气体运动 ===

    // 上升（概率 0.25）
    if (Math.random() < 0.25 && y > 0 && world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    // 斜上方
    if (y > 0) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        world.swap(x, y, nx, y - 1);
        world.markUpdated(nx, y - 1);
        return;
      }
    }

    // 横向扩散（概率 0.2）
    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 偶尔下沉（概率 0.02）
    if (Math.random() < 0.02 && y < world.height - 1 && world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Deuterium);
