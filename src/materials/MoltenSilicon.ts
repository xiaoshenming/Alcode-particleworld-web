import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 液态硅 —— 高温熔融态硅
 * - 液体，密度 4.5
 * - 低温(<1000°)凝固为硅(188)
 * - 发光：橙红色
 * - 遇水(2)产生蒸汽爆炸（水变蒸汽8）
 * - 液体流动逻辑
 */

export const MoltenSilicon: MaterialDef = {
  id: 189,
  name: '液态硅',
  color() {
    // 橙红色发光
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 亮橙红
      r = 235 + Math.floor(Math.random() * 20);
      g = 100 + Math.floor(Math.random() * 50);
      b = 15 + Math.floor(Math.random() * 20);
    } else if (phase < 0.8) {
      // 深红
      r = 210 + Math.floor(Math.random() * 30);
      g = 60 + Math.floor(Math.random() * 35);
      b = 10 + Math.floor(Math.random() * 15);
    } else {
      // 黄白高光（发光效果）
      r = 255;
      g = 190 + Math.floor(Math.random() * 50);
      b = 70 + Math.floor(Math.random() * 50);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 4.5,
  update(x: number, y: number, world: WorldAPI) {
    let temp = world.getTemp(x, y);

    // 保持高温
    if (temp < 1200) {
      world.setTemp(x, y, 1200);
      temp = 1200;
    }

    // 自然冷却
    world.addTemp(x, y, -1);

    // 刷新颜色（发光闪烁）
    world.set(x, y, 189);

    // 低温凝固为硅
    if (temp < 1000 && Math.random() < 0.06) {
      world.set(x, y, 188); // 硅
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

      // 遇水产生蒸汽爆炸
      if (nid === 2) {
        world.set(nx, ny, 8); // 水变蒸汽
        world.setTemp(nx, ny, 200);
        world.wakeArea(nx, ny);
        // 爆炸冲击：周围额外产生蒸汽
        for (const [dx2, dy2] of dirs) {
          const ex = nx + dx2, ey = ny + dy2;
          if (world.inBounds(ex, ey) && world.get(ex, ey) === 2) {
            world.set(ex, ey, 8); // 蒸汽
            world.setTemp(ex, ey, 150);
            world.wakeArea(ex, ey);
          }
        }
        // 液态硅降温
        world.addTemp(x, y, -300);
        world.wakeArea(x, y);
        continue;
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5 || nid === 22) && Math.random() < 0.15) {
        world.set(nx, ny, 6); // 火
        world.setTemp(nx, ny, 200);
        world.markUpdated(nx, ny);
        world.wakeArea(nx, ny);
        continue;
      }

      // 传热给邻居
      const nTemp = world.getTemp(nx, ny);
      if (temp > nTemp) {
        const transfer = (temp - nTemp) * 0.06;
        world.addTemp(nx, ny, transfer);
        world.addTemp(x, y, -transfer);
      }
    }

    // 重力下落
    if (y + 1 < world.height && Math.random() < 0.5) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < 4.5 && belowDensity !== Infinity && Math.random() < 0.3) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        world.wakeArea(x, y + 1);
        return;
      }

      // 斜下流动
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (const d of [dir, -dir]) {
        const nx = x + d;
        if (world.inBounds(nx, y + 1) && world.isEmpty(nx, y + 1)) {
          world.swap(x, y, nx, y + 1);
          world.wakeArea(x, y);
          world.wakeArea(nx, y + 1);
          return;
        }
      }
    }

    // 缓慢水平扩散
    if (Math.random() < 0.08) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.wakeArea(x, y);
        world.wakeArea(nx, y);
      }
    }
  },
};

registerMaterial(MoltenSilicon);
