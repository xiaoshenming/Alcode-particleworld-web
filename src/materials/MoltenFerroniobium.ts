import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铌铁 —— 熔融状态的铌铁合金
 * - 液体，密度 8.0
 * - 冷却至 <2400° → 凝固为铌铁合金(326)
 * - 接触水(2)剧烈冷却产生蒸汽
 * - 深灰蓝色液态
 */

export const MoltenFerroniobium: MaterialDef = {
  id: 327,
  name: '液态铌铁',
  category: '熔融金属',
  description: '熔融状态的铌铁合金',
  density: 8.0,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 180 + Math.floor(Math.random() * 30);
      g = 130 + Math.floor(Math.random() * 20);
      b = 100 + Math.floor(Math.random() * 20);
    } else {
      r = 220 + Math.floor(Math.random() * 25);
      g = 160 + Math.floor(Math.random() * 25);
      b = 120 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 2400) {
      world.set(x, y, 326);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 散热
    if (temp > 20) {
      world.addTemp(x, y, -2);
    }

    if (y >= world.height - 1) return;

    // 重力下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 斜下
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

    // 接触水剧烈冷却
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 2 && Math.random() < 0.8) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(x, y, -50);
      }
    }
  },
};

registerMaterial(MoltenFerroniobium);
