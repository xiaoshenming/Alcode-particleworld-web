import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 检查目标位置是否可以被当前密度的粒子穿过 */
function canDisplace(x: number, y: number, myDensity: number, world: WorldAPI): boolean {
  if (world.isEmpty(x, y)) return true;
  return world.getDensity(x, y) < myDensity;
}

/**
 * 盐 —— 粉末类，白色晶体
 * - 接触水 → 溶解为盐水（概率性）
 * - 接触熔岩 → 熔化消失
 * - 物理行为类似沙子
 */
export const Salt: MaterialDef = {
  id: 23,
  name: '盐',
  color() {
    const v = 220 + Math.floor(Math.random() * 35);
    return (0xFF << 24) | (v << 16) | (v << 8) | v; // 白色微变
  },
  density: 3,
  update(x: number, y: number, world: WorldAPI) {
    // 检查邻居：溶解反应
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 盐 + 水 → 盐水（盐消失，水变盐水）
      if (nid === 2 && Math.random() < 0.08) {
        world.set(nx, ny, 24); // 水变盐水
        world.set(x, y, 0);   // 盐溶解
        return;
      }

      // 盐 + 熔岩 → 盐熔化
      if (nid === 11 && Math.random() < 0.2) {
        world.set(x, y, 0);
        return;
      }
    }

    if (y >= world.height - 1) return;

    // 粉末物理：下落 + 斜下
    if (canDisplace(x, y + 1, Salt.density, world)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, Salt.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(Salt);
