import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 点燃木炭的热源 */
const CHARCOAL_IGNITORS = new Set([6, 11, 28]); // 火、熔岩、火花

/** 木炭 —— 木头燃烧后的产物，粉末状，可再次点燃，燃烧更持久
 * 新增：接触火/熔岩/火花时直接点燃（不依赖温度系统）
 */
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

    // 接触点火源（火/熔岩/火花）直接点燃
    if (world.inBounds(x, y - 1) && CHARCOAL_IGNITORS.has(world.get(x, y - 1))) {
      world.set(x, y, 6);
      world.setTemp(x, y, 200);
      return;
    }
    if (world.inBounds(x, y + 1) && CHARCOAL_IGNITORS.has(world.get(x, y + 1))) {
      world.set(x, y, 6);
      world.setTemp(x, y, 200);
      return;
    }
    if (world.inBounds(x - 1, y) && CHARCOAL_IGNITORS.has(world.get(x - 1, y))) {
      world.set(x, y, 6);
      world.setTemp(x, y, 200);
      return;
    }
    if (world.inBounds(x + 1, y) && CHARCOAL_IGNITORS.has(world.get(x + 1, y))) {
      world.set(x, y, 6);
      world.setTemp(x, y, 200);
      return;
    }

    // 接触酸液(9)：浓酸侵蚀木炭表面，缓慢溶解产生气泡（约167帧≈2.8秒）
    // 化学：C + H2SO4(浓) → CO2↑ + SO2↑ + H2O（高温脱水氧化）
    if (Math.random() < 0.006) {
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 9) {
        world.set(x, y, 0); // 木炭溶解消失
        // 产生烟（模拟CO2/SO2气泡）
        if (world.inBounds(x, y + 1) && world.isEmpty(x, y + 1)) { world.set(x, y + 1, 7); world.markUpdated(x, y + 1); }
        world.wakeArea(x, y); return;
      }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 9) {
        world.set(x, y, 0);
        world.wakeArea(x, y); return;
      }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 9) {
        world.set(x, y, 0);
        world.wakeArea(x, y); return;
      }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 9) {
        world.set(x, y, 0);
        world.wakeArea(x, y); return;
      }
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
        {
      const d = dir;
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }
    {
      const d = -dir;
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
