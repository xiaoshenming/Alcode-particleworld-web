import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态锇 —— 熔融状态的锇
 * - 液体，密度极高(22.59)
 * - 冷却至 <2900° → 凝固为锇(311)
 * - 极高温液体，接触水(2)产生剧烈蒸发
 * - 亮蓝白色
 */

export const MoltenOsmium: MaterialDef = {
  id: 312,
  name: '液态锇',
  category: '熔融金属',
  description: '熔融状态的锇，极高温液体',
  density: 22.59,
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      r = 200 + Math.floor(Math.random() * 30);
      g = 210 + Math.floor(Math.random() * 25);
      b = 240 + Math.floor(Math.random() * 15);
    } else {
      r = 230 + Math.floor(Math.random() * 25);
      g = 235 + Math.floor(Math.random() * 20);
      b = 255;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 冷却凝固
    if (temp < 2900) {
      world.set(x, y, 311);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 缓慢散热
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

    // 密度置换
    if (world.inBounds(x, y + 1) && world.getDensity(x, y + 1) < 22.59) {
      const nid = world.get(x, y + 1);
      if (nid !== 0) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
    }

    // 斜下
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
        world.swap(x, y, nx, y + 1);
        world.markUpdated(nx, y + 1);
        return;
      }
    }

    // 水平流动
    for (const d of [dir, -dir]) {
      const nx = x + d;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 接触水产生剧烈蒸发
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);
      if (nid === 2 && Math.random() < 0.9) {
        world.set(nx, ny, 8); // 蒸汽
        world.setTemp(nx, ny, 200);
        world.addTemp(x, y, -50);
      }
    }
  },
};

registerMaterial(MoltenOsmium);
