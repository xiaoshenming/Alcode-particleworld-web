import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 陨石 —— 从天空高速坠落的炽热岩石
 * - 高密度固体，受重力快速下落
 * - 携带极高温度，点燃/融化沿途材质
 * - 撞击固体时爆炸：产生熔岩、火、烟
 * - 穿透液体和气体，在固体上停止
 * - 暗红/橙色炽热外观，带火焰拖尾
 */

/** 可被陨石点燃的材质 */
const IGNITABLE = new Set([4, 5, 13, 22, 25, 26, 46, 57]); // 木头、油、植物、火药、蜡、液蜡、木炭、藤蔓

/** 可被陨石融化的材质 */
const MELTABLE = new Set([1, 14, 15, 17]); // 沙子、冰、雪、玻璃

/** 陨石会被阻挡的坚硬固体 */
const HARD_SOLID = new Set([3, 10, 34, 36, 53, 32]); // 石头、金属、水泥、混凝土、水晶、钻石

export const Meteor: MaterialDef = {
  id: 58,
  name: '陨石',
  color() {
    // 暗红/橙色炽热
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 暗红
      r = 180 + Math.floor(Math.random() * 75);
      g = 40 + Math.floor(Math.random() * 50);
      b = 10 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 橙色
      r = 220 + Math.floor(Math.random() * 35);
      g = 100 + Math.floor(Math.random() * 60);
      b = 10 + Math.floor(Math.random() * 15);
    } else {
      // 亮黄核心
      r = 250;
      g = 200 + Math.floor(Math.random() * 50);
      b = 50 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 10.0, // 极重
  update(x: number, y: number, world: WorldAPI) {
    // 持续高温
    world.setTemp(x, y, 250);

    // 留下火焰拖尾
    if (y > 0 && world.isEmpty(x, y - 1) && Math.random() < 0.6) {
      world.set(x, y - 1, 6); // 火
      world.markUpdated(x, y - 1);
    }

    // 加热周围
    const dirs8: [number, number][] = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
      [-1, -1], [1, -1], [-1, 1], [1, 1],
    ];
    for (const [dx, dy] of dirs8) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      world.addTemp(nx, ny, 10);
      const nid = world.get(nx, ny);

      // 点燃可燃物
      if (IGNITABLE.has(nid)) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }

      // 融化
      if (MELTABLE.has(nid) && Math.random() < 0.3) {
        world.set(nx, ny, nid === 14 || nid === 15 ? 2 : 11); // 冰/雪→水，其他→熔岩
        world.markUpdated(nx, ny);
      }
    }

    if (y >= world.height - 1) {
      // 到达底部，爆炸
      explode(x, y, world);
      return;
    }

    const belowId = world.get(x, y + 1);

    // 撞击坚硬固体：爆炸
    if (HARD_SOLID.has(belowId)) {
      explode(x, y, world);
      return;
    }

    // 穿透/摧毁软材质
    if (!world.isEmpty(x, y + 1) && !HARD_SOLID.has(belowId)) {
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < Infinity) {
        // 摧毁软材质并继续下落
        world.set(x, y + 1, 0);
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 不可移动的固体，爆炸
      explode(x, y, world);
      return;
    }

    // 正常下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

/** 陨石爆炸：在周围产生熔岩、火、烟 */
function explode(cx: number, cy: number, world: WorldAPI): void {
  const radius = 3;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      const nx = cx + dx, ny = cy + dy;
      if (!world.inBounds(nx, ny)) continue;

      const nid = world.get(nx, ny);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 中心区域变成熔岩
      if (dist < 1.5) {
        if (nid === 0 || world.getDensity(nx, ny) < Infinity) {
          world.set(nx, ny, 11); // 熔岩
          world.markUpdated(nx, ny);
        }
      } else if (dist < 2.5) {
        // 中间区域变成火
        if (world.isEmpty(nx, ny)) {
          world.set(nx, ny, 6);
          world.markUpdated(nx, ny);
        }
      } else {
        // 外围产生烟
        if (world.isEmpty(nx, ny) && Math.random() < 0.5) {
          world.set(nx, ny, 7);
          world.markUpdated(nx, ny);
        }
      }

      world.addTemp(nx, ny, 50);
      world.wakeArea(nx, ny);
    }
  }

  // 自身消失（已变成熔岩）
  world.set(cx, cy, 11);
}

registerMaterial(Meteor);
