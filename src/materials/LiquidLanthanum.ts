import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态镧 —— 熔融状态的镧
 * - 液体，密度 5.9
 * - 冷却至 <920° → 凝固为镧(366)
 * - 接触水(2)剧烈反应产生蒸汽
 * - 极易氧化：接触空气缓慢产生烟(7)
 * - 银色液态
 */

export const LiquidLanthanum: MaterialDef = {
  id: 367,
  name: '液态镧',
  category: '熔融金属',
  description: '熔融状态的镧，银色液体',
  density: 5.9,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 亮银色高温
      r = 215 + Math.floor(Math.random() * 15);
      g = 218 + Math.floor(Math.random() * 15);
      b = 225 + Math.floor(Math.random() * 12);
    } else {
      // 暖银白
      r = 225 + Math.floor(Math.random() * 12);
      g = 220 + Math.floor(Math.random() * 12);
      b = 210 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 920) {
      world.set(x, y, 366); // 镧
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 自然冷却
    if (temp > 20) {
      world.addTemp(x, y, -1.5);
    }

    if (y >= world.height - 1) return;

    // 下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下流动
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

    // 水平流动
        {
      const d = dir;
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }
    {
      const d = -dir;
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 化学反应
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈反应
      if (nid === 2 && Math.random() < 0.8) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, -40);
      }

      // 氧化产烟
      if (nid === 0 && Math.random() < 0.01) {
        world.set(nx, ny, 7);
        world.wakeArea(nx, ny);
      }
    }
  },
};

registerMaterial(LiquidLanthanum);
