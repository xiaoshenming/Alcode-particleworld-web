import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/** 点火源：火、熔岩、火花 */
const HONEY_IGNITORS = new Set([6, 11, 28]);

/** 蜂蜜 —— 高粘度液体，流动缓慢，可粘住轻质粒子
 * 新增：接触火/熔岩/火花时直接焦化为烟（糖的燃烧反应）
 * 新增：接触酸液(9)→分解（酸催化糖分水解→变为水，约2.5秒）
 * 新增：接触水(2)→稀释（长时间浸泡后溶入水中，约17秒）
 */
export const Honey: MaterialDef = {
  id: 45,
  name: '蜂蜜',
  color() {
    const r = 220 + Math.floor(Math.random() * 20);
    const g = 160 + Math.floor(Math.random() * 20);
    const b = 20 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 3,
  update(x: number, y: number, world: WorldAPI) {
    // 高温变稀（流动更快）
    const temp = world.getTemp(x, y);
    // 超高温蒸发为烟
    if (temp > 200) {
      world.set(x, y, 7); // 烟
      return;
    }

    // 接触火/熔岩/火花：蜂蜜糖分燃烧→焦烟
    if (world.inBounds(x, y - 1) && HONEY_IGNITORS.has(world.get(x, y - 1))) {
      world.set(x, y, 7); // 焦化为烟
      world.setTemp(x, y, 100);
      return;
    }
    if (world.inBounds(x, y + 1) && HONEY_IGNITORS.has(world.get(x, y + 1))) {
      world.set(x, y, 7);
      world.setTemp(x, y, 100);
      return;
    }
    if (world.inBounds(x - 1, y) && HONEY_IGNITORS.has(world.get(x - 1, y))) {
      world.set(x, y, 7);
      world.setTemp(x, y, 100);
      return;
    }
    if (world.inBounds(x + 1, y) && HONEY_IGNITORS.has(world.get(x + 1, y))) {
      world.set(x, y, 7);
      world.setTemp(x, y, 100);
      return;
    }

    // 接触酸液(9)：酸催化糖分水解→蜂蜜分解为水（约150帧≈2.5秒）
    // 化学：C12H22O11 + H2SO4 → 6CO2 + 11H2O（糖在酸催化下分解）
    if (Math.random() < 0.007) {
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 9) { world.set(x, y, 2); world.wakeArea(x, y); return; }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 9) { world.set(x, y, 2); world.wakeArea(x, y); return; }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 9) { world.set(x, y, 2); world.wakeArea(x, y); return; }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 9) { world.set(x, y, 2); world.wakeArea(x, y); return; }
    }

    // 接触水(2)：水稀释蜂蜜→溶入水中（约1000帧≈17秒，需长时间浸泡）
    // 物理：蜂蜜高度吸湿，水分子不断渗入稀释糖分直至完全溶解
    if (Math.random() < 0.001) {
      if (world.inBounds(x, y - 1) && world.get(x, y - 1) === 2) { world.set(x, y, 2); world.wakeArea(x, y); return; }
      if (world.inBounds(x, y + 1) && world.get(x, y + 1) === 2) { world.set(x, y, 2); world.wakeArea(x, y); return; }
      if (world.inBounds(x - 1, y) && world.get(x - 1, y) === 2) { world.set(x, y, 2); world.wakeArea(x, y); return; }
      if (world.inBounds(x + 1, y) && world.get(x + 1, y) === 2) { world.set(x, y, 2); world.wakeArea(x, y); return; }
    }

    // 粘度：温度越低越粘，只有一定概率才移动
    // 常温下约 30% 概率移动，高温下更活跃
    const moveChance = Math.min(0.8, 0.3 + (temp - 20) * 0.005);
    if (Math.random() > moveChance) {
      world.wakeArea(x, y); // 保持活跃，下帧再试
      return;
    }

    if (y >= world.height - 1) return;

    // 1. 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 2. 斜下（粘稠，只尝试紧邻的斜下方）
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

    // 3. 水平流动（非常缓慢，只移动 1 格）
        {
      const d = dir;
      const sx = x + d;
      if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
    }
    {
      const d = -dir;
      const sx = x + d;
      if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
        world.swap(x, y, sx, y);
        world.markUpdated(sx, y);
        return;
      }
    }

    // 4. 密度置换：蜂蜜比水重，下沉
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < Honey.density && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(Honey);
