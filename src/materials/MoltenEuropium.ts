import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铕 —— 熔融状态的铕
 * - 液体，密度 5.2
 * - 冷却至 <822° → 凝固为铕(351)
 * - 接触水(2)剧烈反应产生蒸汽和氢气(19)
 * - 明亮金黄色液态
 */

export const MoltenEuropium: MaterialDef = {
  id: 352,
  name: '液态铕',
  category: '熔融金属',
  description: '熔融状态的铕',
  density: 5.2,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      r = 240 + Math.floor(Math.random() * 15);
      g = 180 + Math.floor(Math.random() * 25);
      b = 60 + Math.floor(Math.random() * 20);
    } else {
      r = 250 + Math.floor(Math.random() * 5);
      g = 200 + Math.floor(Math.random() * 20);
      b = 75 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 凝固
    if (temp < 822) {
      world.set(x, y, 351);
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

    // 接触水 → 剧烈反应
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      if (world.get(nx, ny) === 2 && Math.random() < 0.8) {
        world.set(nx, ny, Math.random() < 0.3 ? 19 : 8); // 氢气或蒸汽
        world.addTemp(x, y, -40);
      }
    }
  },
};

registerMaterial(MoltenEuropium);
