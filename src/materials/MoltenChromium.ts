import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铬 —— 银白色高温液态金属
 * - 液体，密度 6.5
 * - 温度<1907° 凝固为铬(206)
 * - 发出橙白色光芒
 * - 接触水产生蒸汽爆炸
 */

export const MoltenChromium: MaterialDef = {
  id: 207,
  name: '液态铬',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.6) {
      // 橙白色高温
      r = 240 + Math.floor(Math.random() * 15);
      g = 180 + Math.floor(Math.random() * 40);
      b = 100 + Math.floor(Math.random() * 40);
    } else {
      // 亮白色高光
      r = 250 + Math.floor(Math.random() * 5);
      g = 220 + Math.floor(Math.random() * 30);
      b = 160 + Math.floor(Math.random() * 40);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 6.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);
    world.setTemp(x, y, Math.max(temp, 1950));
    world.wakeArea(x, y);
    world.set(x, y, 207); // 刷新颜色

    // 冷却凝固
    if (temp < 1907) {
      world.set(x, y, 206);
      world.wakeArea(x, y);
      return;
    }

    // 检查四邻
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 接触水：蒸汽爆炸
      if (nid === 2) {
        world.set(nx, ny, 8); // 蒸汽
        world.addTemp(nx, ny, 200);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5 || nid === 13) && Math.random() < 0.15) {
        world.set(nx, ny, 6);
        world.markUpdated(nx, ny);
      }
    }

    // 缓慢散热
    if (Math.random() < 0.02) {
      world.addTemp(x, y, -15);
    }

    // === 液体流动 ===
    if (y >= world.height - 1) return;

    if (Math.random() < 0.5) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

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
    }

    // 水平流动
    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y) && world.isEmpty(x + dir, y)) {
        world.swap(x, y, x + dir, y);
        world.markUpdated(x + dir, y);
        return;
      }
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 6.5 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(MoltenChromium);
