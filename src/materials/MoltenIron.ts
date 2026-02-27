import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态铁 —— 极高温液态金属
 * - 密度 7.0（很重）
 * - 低温(<800°)凝固为金属(10)
 * - 极高温：点燃一切可燃物
 * - 遇水(2)产生蒸汽爆炸（水变蒸汽8，产生火花28）
 * - 亮橙黄色发光液体
 */

/** 可燃材质 */
const FLAMMABLE = new Set([4, 5, 13, 22, 25, 26, 49, 57, 91, 134]); // 木头、油、植物、火药、蜡、液蜡、苔藓、藤蔓、纤维、干草

export const MoltenIron: MaterialDef = {
  id: 169,
  name: '液态铁',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 亮橙黄
      r = 245 + Math.floor(Math.random() * 10);
      g = 160 + Math.floor(Math.random() * 50);
      b = 20 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 白黄高光
      r = 255;
      g = 210 + Math.floor(Math.random() * 30);
      b = 80 + Math.floor(Math.random() * 40);
    } else {
      // 深橙红
      r = 230 + Math.floor(Math.random() * 20);
      g = 120 + Math.floor(Math.random() * 30);
      b = 10 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 7.0,
  update(x: number, y: number, world: WorldAPI) {
    let temp = world.getTemp(x, y);

    // 保持高温
    if (temp < 1200) {
      world.setTemp(x, y, 1200);
      temp = 1200;
    }

    // 自然冷却
    world.addTemp(x, y, -0.3);

    // 刷新颜色（发光闪烁）
    world.set(x, y, 169);

    // 低温凝固为金属
    if (temp < 800 && Math.random() < 0.06) {
      world.set(x, y, 10); // 金属
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水蒸汽爆炸
      if (nid === 2) {
        world.set(nx, ny, 8); // 水→蒸汽
        world.setTemp(nx, ny, 150);
        world.wakeArea(nx, ny);
        // 在蒸汽周围产生火花
        for (const [dx2, dy2] of dirs) {
          const fx = nx + dx2, fy = ny + dy2;
          if (world.inBounds(fx, fy) && world.isEmpty(fx, fy) && Math.random() < 0.4) {
            world.set(fx, fy, 28); // 火花
            world.markUpdated(fx, fy);
            world.wakeArea(fx, fy);
          }
        }
        continue;
      }

      // 点燃可燃物
      if (FLAMMABLE.has(nid) && Math.random() < 0.15) {
        world.set(nx, ny, 6); // 火
        world.setTemp(nx, ny, 200);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        continue;
      }

      // 传热给邻居
      if (nid !== 0) {
        const nTemp = world.getTemp(nx, ny);
        if (temp > nTemp) {
          const transfer = (temp - nTemp) * 0.06;
          world.addTemp(nx, ny, transfer);
          world.addTemp(x, y, -transfer);
        }
      }
    }

    if (y >= world.height - 1) return;

    // 缓慢下落（高粘度重液体）
    if (Math.random() < 0.5) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 密度置换：液态铁极重，沉入一切轻液体
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < MoltenIron.density && belowDensity < Infinity) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.markUpdated(nx, y + 1);
          world.wakeArea(x, y);
          return;
        }
      }
    }

    // 极缓慢水平扩散
    if (Math.random() < 0.08) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        world.wakeArea(x, y);
      }
    }
  },
};

registerMaterial(MoltenIron);
