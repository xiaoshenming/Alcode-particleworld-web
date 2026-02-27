import { DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 火药 —— 粉末类，遇火/熔岩/雷电爆炸
 * - 爆炸产生冲击波，摧毁周围粒子
 * - 爆炸中心变火，外围变烟
 * - 链式反应：爆炸可引爆附近火药
 */

function canDisplace(x: number, y: number, myDensity: number, world: WorldAPI): boolean {
  if (world.isEmpty(x, y)) return true;
  return world.getDensity(x, y) < myDensity;
}

/** 触发爆炸的材质 */
const IGNITORS = new Set([6, 11, 16]); // 火、熔岩、雷电

/** 在指定位置产生爆炸 */
function explode(cx: number, cy: number, radius: number, world: WorldAPI): void {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = dx * dx + dy * dy;
      if (dist > radius * radius) continue;

      const nx = cx + dx;
      const ny = cy + dy;
      if (!world.inBounds(nx, ny)) continue;

      const id = world.get(nx, ny);

      // 不摧毁不可破坏的材质（石头、金属、玻璃）
      if (id === 3 || id === 10 || id === 17) continue;

      // 中心区域变火
      if (dist < (radius * radius) / 3) {
        if (id !== 22) { // 不重复处理火药（避免无限递归）
          world.set(nx, ny, 6); // 火
        }
      } else if (dist < (radius * radius) * 2 / 3) {
        // 中间区域：摧毁并变烟
        world.set(nx, ny, Math.random() < 0.5 ? 7 : 0); // 烟或空气
      } else {
        // 外围：概率摧毁
        if (Math.random() < 0.4 && id !== 0) {
          world.set(nx, ny, Math.random() < 0.3 ? 7 : 0);
        }
      }
      world.wakeArea(nx, ny);
    }
  }
}

export const Gunpowder: MaterialDef = {
  id: 22,
  name: '火药',
  color() {
    const v = 40 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (v << 16) | (v << 8) | v; // 深灰色
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居：遇到点火源则爆炸
    for (const [dx, dy] of DIRS8) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (IGNITORS.has(world.get(nx, ny))) {
        // 爆炸！
        const radius = 4 + Math.floor(Math.random() * 3); // 4~6 格半径
        explode(x, y, radius, world);
        world.set(x, y, 6); // 自身变火
        return;
      }
    }

    if (y >= world.height - 1) return;

    // 正常粉末下落
    if (canDisplace(x, y + 1, Gunpowder.density, world)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
        {
      const d = dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, Gunpowder.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, Gunpowder.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(Gunpowder);
