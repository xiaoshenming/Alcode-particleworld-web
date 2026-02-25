import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 钠 —— 活泼金属
 * - 固体粉末，受重力影响
 * - 遇水剧烈反应：爆炸产生火焰和氢气
 * - 遇酸液也会反应（产生氢气）
 * - 在空气中缓慢氧化（表面变暗）
 * - 遇火/高温会燃烧（产生明亮黄色火焰）
 * - 视觉上呈银白色金属光泽
 */

/** 水系材质 */
const WATER_LIKE = new Set([2, 24, 45]); // 水、盐水、蜂蜜（含水）

export const Sodium: MaterialDef = {
  id: 79,
  name: '钠',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银白色
      r = 195 + Math.floor(Math.random() * 25);
      g = 200 + Math.floor(Math.random() * 20);
      b = 205 + Math.floor(Math.random() * 15);
    } else if (phase < 0.8) {
      // 略带暖色的金属光泽
      r = 210 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 15);
      b = 185 + Math.floor(Math.random() * 15);
    } else {
      // 亮银高光
      r = 220 + Math.floor(Math.random() * 20);
      g = 222 + Math.floor(Math.random() * 18);
      b = 225 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.5, // 比水轻的金属
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃
    if (temp > 100 && Math.random() < 0.1) {
      world.set(x, y, 6); // 火
      world.setTemp(x, y, 300);
      world.wakeArea(x, y);
      // 周围产生火花
      const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (world.inBounds(nx, ny) && world.isEmpty(nx, ny) && Math.random() < 0.3) {
          world.set(nx, ny, 28); // 火花
          world.wakeArea(nx, ny);
        }
      }
      return;
    }

    // 检查邻居
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈反应！
      if (WATER_LIKE.has(nid)) {
        // 钠变为火
        world.set(x, y, 6);
        world.setTemp(x, y, 400);
        // 水变为氢气
        world.set(nx, ny, 19); // 氢气
        world.markUpdated(nx, ny);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        // 周围扩散爆炸效果
        for (const [ddx, ddy] of dirs) {
          const nnx = x + ddx, nny = y + ddy;
          if (!world.inBounds(nnx, nny)) continue;
          if (world.isEmpty(nnx, nny)) {
            world.set(nnx, nny, Math.random() < 0.5 ? 6 : 28); // 火或火花
            world.wakeArea(nnx, nny);
          } else if (WATER_LIKE.has(world.get(nnx, nny)) && Math.random() < 0.4) {
            world.set(nnx, nny, 8); // 蒸汽
            world.wakeArea(nnx, nny);
          }
        }
        return;
      }

      // 遇酸液反应
      if (nid === 9 && Math.random() < 0.2) {
        world.set(x, y, 0); // 溶解
        world.set(nx, ny, 19); // 氢气
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇火点燃
      if (nid === 6 && Math.random() < 0.3) {
        world.set(x, y, 6);
        world.setTemp(x, y, 350);
        world.wakeArea(x, y);
        return;
      }
    }

    // 重力下落
    if (y + 1 < world.height) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 斜下滑落
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1) && world.isEmpty(nx, y)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }
  },
};

registerMaterial(Sodium);
