import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铯 —— 铯的熔融态
 * - 液体，密度 1.9（较轻液态金属）
 * - 冷却 <26° → 固态铯(436)
 * - 沸点 >671° → 蒸汽
 * - 遇水剧烈爆炸
 * - 金黄色液态金属
 */

export const MoltenCesium: MaterialDef = {
  id: 437,
  name: '液态铯',
  category: '熔融金属',
  description: '铯的液态形式，金黄色，遇水剧烈爆炸产生火焰',
  density: 1.9,
  color() {
    const r = 220 + Math.floor(Math.random() * 25);
    const g = 195 + Math.floor(Math.random() * 20);
    const b = 70 + Math.floor(Math.random() * 25);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    if (temp < 26) {
      world.set(x, y, 436);
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    if (temp > 671) {
      world.set(x, y, 8);
      world.wakeArea(x, y);
      return;
    }

    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈爆炸
      if (nid === 2 && Math.random() < 0.9) {
        world.set(x, y, 6);
        world.set(nx, ny, 8);
        world.addTemp(x, y, 800);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }

      // 遇酸反应
      if (nid === 9 && Math.random() < 0.4) {
        world.set(x, y, 0);
        world.set(nx, ny, 7);
        world.addTemp(nx, ny, 300);
        world.wakeArea(x, y);
        return;
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5) && temp > 50 && Math.random() < 0.2) {
        world.set(nx, ny, 6);
        world.wakeArea(nx, ny);
      }

      if (nid !== 0 && Math.random() < 0.1) {
        const nt = world.getTemp(nx, ny);
        const diff = (nt - temp) * 0.12;
        world.addTemp(x, y, diff);
        world.addTemp(nx, ny, -diff);
      }
    }

    // 重力下落
    if (world.inBounds(x, y + 1)) {
      const below = world.get(x, y + 1);
      if (below === 0) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity < 1.9 && belowDensity > 0 && Math.random() < 0.5) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y + 1);
        return;
      }
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.get(x + dir, y + 1) === 0) {
        world.swap(x, y, x + dir, y + 1);
        world.wakeArea(x + dir, y + 1);
        return;
      }
      if (world.inBounds(x - dir, y + 1) && world.get(x - dir, y + 1) === 0) {
        world.swap(x, y, x - dir, y + 1);
        world.wakeArea(x - dir, y + 1);
        return;
      }
      if (world.inBounds(x + dir, y) && world.get(x + dir, y) === 0) {
        world.swap(x, y, x + dir, y);
        world.wakeArea(x + dir, y);
      }
    }
  },
};

registerMaterial(MoltenCesium);
