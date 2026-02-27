import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 磷化氢 —— PH3，剧毒易燃气体
 * - 气体，密度 0.2，向上飘升
 * - 极易燃：遇火(6)/火花(28)立即爆炸（产生火+烟）
 * - 有毒：接触植物(13)/苔藓(49)使其枯萎（变为空气）
 * - 自燃：温度>100°自动点燃
 * - 淡黄绿色半透明气体
 */

/** 点火源 */
const IGNITORS = new Set([6, 11, 28, 55, 16, 47, 48]); // 火、熔岩、火花、等离子体、雷电、激光、光束

/** 可被毒杀的有机材质 */
const ORGANIC = new Set([13, 49, 12, 57]); // 植物、苔藓、种子、藤蔓

export const Phosphine: MaterialDef = {
  id: 180,
  name: '磷化氢',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 淡黄绿色
      r = 160 + Math.floor(Math.random() * 25);
      g = 185 + Math.floor(Math.random() * 25);
      b = 80 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 偏绿
      r = 130 + Math.floor(Math.random() * 20);
      g = 170 + Math.floor(Math.random() * 20);
      b = 70 + Math.floor(Math.random() * 15);
    } else {
      // 淡黄高光
      r = 190 + Math.floor(Math.random() * 20);
      g = 200 + Math.floor(Math.random() * 15);
      b = 90 + Math.floor(Math.random() * 15);
    }
    // 半透明
    return (0xBB << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.2,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃
    if (temp > 100 && Math.random() < 0.3) {
      explode(x, y, world);
      return;
    }

    // 自然消散（有限寿命）
    if (Math.random() < 0.003) {
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

      // 有毒：杀死有机物
      if (ORGANIC.has(nid) && Math.random() < 0.15) {
        world.set(nx, ny, 0); // 枯萎消失
        world.wakeArea(nx, ny);
      }
    }

    // 气体上升逻辑
    if (y > 0 && Math.random() < 0.35) {
      // 直接上升
      if (world.isEmpty(x, y - 1)) {
        world.swap(x, y, x, y - 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y - 1);
        return;
      }

      // 密度置换（穿过比自己重的气体）
      const aboveDensity = world.getDensity(x, y - 1);
      if (aboveDensity > 0.2 && aboveDensity < 1 && Math.random() < 0.3) {
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
    if (wind !== 0 && Math.random() < windStr * 0.4) {
      const nx = x + wind;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
        return;
      }
    }

    // 随机水平扩散
    if (Math.random() < 0.12) {
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

/** 磷化氢爆炸：产生火焰 + 浓烟 */
function explode(cx: number, cy: number, world: WorldAPI): void {
  world.set(cx, cy, 6); // 火
  world.setTemp(cx, cy, 250);
  world.wakeArea(cx, cy);

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = cx + dx, ny = cy + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 链式引爆相邻磷化氢
      if (nid === 180) {
        world.set(nx, ny, 6);
        world.setTemp(nx, ny, 250);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        continue;
      }

      // 空气变火或烟
      if (nid === 0) {
        if (Math.random() < 0.4) {
          world.set(nx, ny, 6); // 火
          world.setTemp(nx, ny, 150);
        } else if (Math.random() < 0.5) {
          world.set(nx, ny, 7); // 烟
        }
        world.markUpdated(nx, ny);
      }

      world.addTemp(nx, ny, 80);
      world.wakeArea(nx, ny);
    }
  }
}

registerMaterial(Phosphine);
