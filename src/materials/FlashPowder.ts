import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 闪光粉 —— 极度易爆的银灰色细粉
 * - 粉末，密度 1.8，可下落堆积
 * - 极度易爆：遇火(6)/火花(28)/熔岩(11)立即爆炸
 * - 爆炸效果：半径3~5范围内产生火花+火+烟，并设置高温
 * - 链式反应：爆炸可以引爆附近的闪光粉
 * - 银灰色细粉
 */

/** 能引爆闪光粉的材质 */
const IGNITORS = new Set([6, 11, 28]); // 火、熔岩、火花

/** 不可被爆炸摧毁的材质 */
const INDESTRUCTIBLE = new Set([3, 10, 17, 36]); // 石头、金属、玻璃、混凝土

/** 闪光粉爆炸 */
function flashExplode(cx: number, cy: number, world: WorldAPI): void {
  const radius = 3 + Math.floor(Math.random() * 3); // 3~5

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = dx * dx + dy * dy;
      if (dist > radius * radius) continue;

      const nx = cx + dx, ny = cy + dy;
      if (!world.inBounds(nx, ny)) continue;

      const id = world.get(nx, ny);

      // 不摧毁不可破坏材质
      if (INDESTRUCTIBLE.has(id)) continue;

      // 闪光粉链式引爆：直接触发爆炸
      if (id === 186 && (dx !== 0 || dy !== 0)) {
        // 将其变为火，下一帧周围闪光粉会被火引爆
        world.set(nx, ny, 6);
        world.setTemp(nx, ny, 600);
        world.wakeArea(nx, ny);
        continue;
      }

      if (dist < (radius * radius) / 4) {
        // 核心区域：火花 + 高温
        world.set(nx, ny, 28); // 火花
        world.setTemp(nx, ny, 800);
      } else if (dist < (radius * radius) / 2) {
        // 中间区域：火
        world.set(nx, ny, 6);
        world.setTemp(nx, ny, 400);
      } else {
        // 外围：烟或空气
        if (id !== 0 && Math.random() < 0.5) {
          world.set(nx, ny, Math.random() < 0.6 ? 7 : 0); // 烟或空气
        }
      }
      world.wakeArea(nx, ny);
    }
  }
}

export const FlashPowder: MaterialDef = {
  id: 186,
  name: '闪光粉',
  color() {
    // 银灰色细粉
    const t = Math.random();
    const base = 160 + Math.floor(t * 40);
    const r = base - 5 + Math.floor(Math.random() * 10);
    const g = base - 3 + Math.floor(Math.random() * 8);
    const b = base + Math.floor(Math.random() * 12);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.8,
  update(x: number, y: number, world: WorldAPI) {
    // 高温也能引爆
    if (world.getTemp(x, y) > 200) {
      flashExplode(x, y, world);
      world.set(x, y, 28); // 自身变火花
      world.setTemp(x, y, 800);
      return;
    }

    // 检查8邻居：遇到点火源则爆炸
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!world.inBounds(nx, ny)) continue;
        if (IGNITORS.has(world.get(nx, ny))) {
          flashExplode(x, y, world);
          world.set(x, y, 28); // 自身变火花
          world.setTemp(x, y, 800);
          return;
        }
      }
    }

    if (y >= world.height - 1) return;

    // 粉末下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下滑落
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 密度置换（沉入轻液体）
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 1.8 && belowDensity !== Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(FlashPowder);
