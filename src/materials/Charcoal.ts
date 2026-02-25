import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 木炭 —— 木头燃烧后的产物，粉末状，可再次点燃，燃烧更持久 */
export const Charcoal: MaterialDef = {
  id: 46,
  name: '木炭',
  color() {
    const v = 30 + Math.floor(Math.random() * 20);
    return (0xFF << 24) | (v << 16) | (v << 8) | v;
  },
  density: 4,
  update(x: number, y: number, world: WorldAPI) {
    // 高温自燃（温度超过 150° 自动点燃）
    if (world.getTemp(x, y) > 150) {
      world.set(x, y, 6); // 火
      return;
    }

    if (y >= world.height - 1) return;

    // 粉末行为：下落
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

    // 密度置换：沉入比自己轻的液体
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < Charcoal.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Charcoal);
