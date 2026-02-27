import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态钨 —— 极高温发光液体，亮白色
 * - 密度 15.0（极重液体）
 * - 低温(<2500°)凝固为钨(199)
 * - 遇水(2)剧烈蒸汽爆炸
 * - 点燃一切可燃物
 * - 粘稠流动（流动慢）
 */

/** 可燃材质 ID */
const FLAMMABLE = new Set([
  4, 5, 13, 22, 25, 26, 46, 49, 57, 91, 134, // 木头、油、植物、火药、蜡、液蜡、木炭、苔藓、藤蔓、纤维、干草
]);

export const MoltenTungsten: MaterialDef = {
  id: 200,
  name: '液态钨',
  color() {
    // 极高温发光：亮白色带黄色调
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 亮白色
      r = 245 + Math.floor(Math.random() * 10);
      g = 240 + Math.floor(Math.random() * 10);
      b = 220 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 白黄色
      r = 255;
      g = 220 + Math.floor(Math.random() * 30);
      b = 180 + Math.floor(Math.random() * 40);
    } else {
      // 橙白高光
      r = 255;
      g = 200 + Math.floor(Math.random() * 30);
      b = 160 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 15.0, // 极重液体
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 维持极高温
    if (temp < 3000) {
      world.setTemp(x, y, Math.max(temp, 2800));
    }

    // 低温(<2500°)凝固为钨
    if (temp < 2500) {
      world.set(x, y, 199); // 钨
      world.wakeArea(x, y);
      return;
    }

    // 刷新颜色（发光闪烁）
    world.set(x, y, 200);

    // 加热周围环境
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水(2)剧烈蒸汽爆炸
      if (nid === 2) {
        world.set(nx, ny, 8); // 水 → 蒸汽
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        // 爆炸扩散：周围也产生蒸汽
        for (const [ddx, ddy] of dirs) {
          const ex = nx + ddx, ey = ny + ddy;
          if (world.inBounds(ex, ey) && world.get(ex, ey) === 2) {
            world.set(ex, ey, 8); // 连锁蒸发
            world.markUpdated(ex, ey);
            world.wakeArea(ex, ey);
          }
        }
        // 爆炸产生火花
        if (world.inBounds(nx, ny - 1) && world.isEmpty(nx, ny - 1)) {
          world.set(nx, ny - 1, 28); // 火花
          world.markUpdated(nx, ny - 1);
        }
        continue;
      }

      // 点燃一切可燃物
      if (FLAMMABLE.has(nid) && Math.random() < 0.3) {
        world.set(nx, ny, 6); // 着火
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 加热邻居
      world.addTemp(nx, ny, 50);
    }

    // 缓慢冷却
    world.addTemp(x, y, -2);

    // 粘稠流动（流动慢，只有 50% 概率移动）
    if (Math.random() > 0.5) {
      world.wakeArea(x, y);
      return;
    }

    if (y >= world.height - 1) return;

    // 1. 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 密度置换（极重，沉入几乎所有液体）
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < MoltenTungsten.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
      world.markUpdated(x, y + 1);
      return;
    }

    // 3. 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 4. 水平流动（缓慢）
    if (Math.random() < 0.2) {
      for (const d of [dir, -dir]) {
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
      }
    }
  },
};

registerMaterial(MoltenTungsten);
