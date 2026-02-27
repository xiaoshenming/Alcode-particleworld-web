import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 检查目标位置是否可以被当前密度的粒子穿过 */
function canDisplace(x: number, y: number, myDensity: number, world: WorldAPI): boolean {
  if (world.isEmpty(x, y)) return true;
  return world.getDensity(x, y) < myDensity;
}

/**
 * 锑 —— 银灰色金属粉末
 * - 固体粉末，可下落堆积
 * - 遇酸(9)缓慢溶解
 * - 高温(>630°)熔化为液态锑(162)
 */
export const Antimony: MaterialDef = {
  id: 161,
  name: '锑',
  color() {
    // 银灰色带金属光泽
    const base = 160 + Math.floor(Math.random() * 25);
    const r = base;
    const g = base + Math.floor(Math.random() * 10);
    const b = base + 5 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 6.0,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温熔化为液态锑
    if (temp > 630) {
      world.set(x, y, 162); // 液态锑
      world.setTemp(x, y, temp);
      return;
    }

    // 检查邻居
    const neighbors: [number, number][] = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
    ];
    for (const [nx, ny] of neighbors) {
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇酸缓慢溶解
      if (nid === 9 && Math.random() < 0.02) {
        world.set(x, y, 0); // 溶解消失
        return;
      }
    }

    // 粉末物理：下落
    if (y >= world.height - 1) return;

    if (canDisplace(x, y + 1, Antimony.density, world)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
        {
      const d = dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, Antimony.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && canDisplace(nx, y + 1, Antimony.density, world)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
  },
};

registerMaterial(Antimony);
