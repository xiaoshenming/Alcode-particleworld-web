import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 臭氧 —— 强氧化性气体
 * - 气体，密度 0.35（比空气略重）
 * - 强氧化性：腐蚀橡胶(33)、塑料(215)
 * - 遇火/火花分解为空气（助燃但自身不燃）
 * - 杀菌：消灭苔藓(49)、菌丝(70)、孢子(93)
 * - 自然分解为空气
 * - 淡蓝色
 */

/** 可被臭氧氧化的有机材质 */
const OXIDIZE_TARGETS = new Set([33, 215, 71]); // 橡胶、热塑性塑料、树脂

/** 可被臭氧杀灭的生物 */
const BIO_TARGETS = new Set([49, 70, 93, 100]); // 苔藓、菌丝、孢子、蘑菇

export const Ozone: MaterialDef = {
  id: 228,
  name: '臭氧',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.7) {
      // 淡蓝色
      r = 170 + Math.floor(Math.random() * 30);
      g = 195 + Math.floor(Math.random() * 30);
      b = 230 + Math.floor(Math.random() * 20);
    } else {
      // 更深蓝
      r = 150 + Math.floor(Math.random() * 30);
      g = 175 + Math.floor(Math.random() * 30);
      b = 220 + Math.floor(Math.random() * 25);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.35,
  update(x: number, y: number, world: WorldAPI) {
    // 自然分解
    if (Math.random() < 0.008) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火分解（助燃）
      if ((nid === 6 || nid === 28) && Math.random() < 0.2) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 氧化橡胶/塑料
      if (OXIDIZE_TARGETS.has(nid) && Math.random() < 0.03) {
        world.set(nx, ny, 7); // 氧化分解为烟
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        world.set(x, y, 0);
        return;
      }

      // 杀灭生物
      if (BIO_TARGETS.has(nid) && Math.random() < 0.05) {
        world.set(nx, ny, 0);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }
    }

    // === 气体缓慢上升 ===
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.35) {
      world.swap(x, y, x, y - 1);
      world.markUpdated(x, y - 1);
      return;
    }

    if (y > 0 && Math.random() < 0.25) {
      const dir = Math.random() < 0.5 ? -1 : 1;
            {
        const d = dir;
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
      {
        const d = -dir;
        const nx = x + d;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          world.swap(x, y, nx, y - 1);
          world.markUpdated(nx, y - 1);
          return;
        }
      }
    }

    if (Math.random() < 0.3) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
      }
    }
  },
};

registerMaterial(Ozone);
