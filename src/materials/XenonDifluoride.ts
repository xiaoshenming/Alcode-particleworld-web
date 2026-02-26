import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 二氟化氙 —— 强氧化性气体/升华固体
 * - 气体，密度 -0.3（缓慢上浮）
 * - 强氧化性：接触金属(10)缓慢腐蚀为铁锈(72)
 * - 接触水分解为氙气(263)+氟化氢(208)
 * - 高温 >400° 分解为氙气
 * - 无色微黄气体
 */

export const XenonDifluoride: MaterialDef = {
  id: 413,
  name: '二氟化氙',
  category: '化学',
  description: '强氧化性稀有气体化合物，可腐蚀金属，遇水分解',
  density: -0.3,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 近透明微黄
      r = 230 + Math.floor(Math.random() * 15);
      g = 228 + Math.floor(Math.random() * 12);
      b = 205 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 淡黄白
      r = 220 + Math.floor(Math.random() * 12);
      g = 218 + Math.floor(Math.random() * 10);
      b = 195 + Math.floor(Math.random() * 12);
    } else {
      // 近白
      r = 240 + Math.floor(Math.random() * 10);
      g = 238 + Math.floor(Math.random() * 10);
      b = 220 + Math.floor(Math.random() * 12);
    }
    return (0xAA << 24) | (b << 16) | (g << 8) | r; // 半透明
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解为氙气
    if (temp > 400) {
      world.set(x, y, 263); // 氙气
      world.wakeArea(x, y);
      return;
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水分解
      if (nid === 2 && Math.random() < 0.08) {
        world.set(x, y, 263); // 氙气
        world.set(nx, ny, 208); // 氟化氢
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 强氧化性腐蚀金属
      if (nid === 10 && Math.random() < 0.03) {
        world.set(nx, ny, 72); // 铁锈
        world.set(x, y, 0);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 腐蚀木头
      if (nid === 4 && Math.random() < 0.02) {
        world.set(nx, ny, 6); // 点燃
        world.set(x, y, 0);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // === 气体运动（上浮） ===
    if (y > 0) {
      const above = world.get(x, y - 1);
      if (above === 0) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
      const aDensity = world.getDensity(x, y - 1);
      if (aDensity > 0) {
        world.swap(x, y, x, y - 1);
        world.markUpdated(x, y - 1);
        return;
      }
    }

    // 横向扩散
    if (Math.random() < 0.45) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 缓慢消散
    if (Math.random() < 0.001) {
      world.set(x, y, 0);
      world.wakeArea(x, y);
    }
  },
};

registerMaterial(XenonDifluoride);
