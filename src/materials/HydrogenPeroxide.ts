import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 过氧化氢 (H₂O₂) —— 强氧化性液体
 * - 无色透明液体，微微起泡
 * - 遇火/火花分解为水 + 蒸汽泡（释放氧气）
 * - 遇血液起泡（产生泡沫）
 * - 遇铁锈催化分解（产生蒸汽）
 * - 高温(>150°)热分解为水
 * - 液体流动逻辑
 */

export const HydrogenPeroxide: MaterialDef = {
  id: 191,
  name: '过氧化氢',
  color() {
    // 无色透明液体，微微泛白/淡蓝
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.7) {
      // 近乎透明的淡蓝白
      r = 210 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 20);
      b = 235 + Math.floor(Math.random() * 20);
    } else {
      // 微微起泡的白色高光
      r = 230 + Math.floor(Math.random() * 25);
      g = 235 + Math.floor(Math.random() * 20);
      b = 240 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.9,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温分解：>150° 变为水
    if (temp > 150) {
      world.set(x, y, 2); // 水
      // 释放蒸汽泡向上
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, 175); // 蒸汽泡
        world.markUpdated(x, y - 1);
      }
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻进行化学反应
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火(6)/火花(28)：氧化分解 → 水 + 蒸汽泡
      if (nid === 6 || nid === 28) {
        world.set(x, y, 2); // 变为水
        // 向上释放蒸汽泡（模拟氧气释放）
        if (y > 0 && world.isEmpty(x, y - 1)) {
          world.set(x, y - 1, 175); // 蒸汽泡
          world.markUpdated(x, y - 1);
        }
        world.wakeArea(x, y);
        return;
      }

      // 遇血液(87)：起泡反应 → 产生泡沫
      if (nid === 87 && Math.random() < 0.15) {
        world.set(nx, ny, 51); // 血液变泡沫
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        // 自身有概率也消耗
        if (Math.random() < 0.3) {
          world.set(x, y, 51); // 变泡沫
          return;
        }
      }

      // 遇铁锈(72)：催化分解 → 产生蒸汽
      if (nid === 72 && Math.random() < 0.1) {
        world.set(x, y, 8); // 变蒸汽
        // 铁锈不消耗（催化剂）
        world.wakeArea(x, y);
        return;
      }
    }

    // 自然微泡：极小概率在上方产生蒸汽泡
    if (Math.random() < 0.003 && y > 0 && world.isEmpty(x, y - 1)) {
      world.set(x, y - 1, 175); // 蒸汽泡
      world.markUpdated(x, y - 1);
    }

    // === 液体流动逻辑 ===
    if (y >= world.height - 1) return;

    // 1. 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换：沉入比自身轻的液体
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 1.9 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 3. 水平流动
    const spread = 3 + Math.floor(Math.random() * 3);
    for (let d = 1; d <= spread; d++) {
      const sx = x + dir * d;
      if (!world.inBounds(sx, y)) break;
      if (world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
      if (!world.isEmpty(sx, y)) break;
    }
    for (let d = 1; d <= spread; d++) {
      const sx = x - dir * d;
      if (!world.inBounds(sx, y)) break;
      if (world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
      if (!world.isEmpty(sx, y)) break;
    }
  },
};

registerMaterial(HydrogenPeroxide);
