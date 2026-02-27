import { DIRS4, DIRS8 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钛 —— 熔融状态的钛金属
 * - 液体，密度 6.0（非常重的液体）
 * - 低温(<1200°)凝固为钛(192)
 * - 极高温发光：亮白色带蓝色
 * - 遇水蒸汽爆炸
 * - 缓慢流动的重液体
 */

export const MoltenTitanium: MaterialDef = {
  id: 193,
  name: '液态钛',
  color() {
    const t = Math.random();
    // 亮白色带蓝色调，模拟极高温发光
    const r = 230 + Math.floor(t * 25);
    const g = 220 + Math.floor(t * 30);
    const b = 240 + Math.floor(Math.random() * 15);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 6.0,
  update(x: number, y: number, world: WorldAPI) {
    // 液态钛产生极高温
    world.setTemp(x, y, 1700);

    // 刷新颜色（高温闪烁）
    world.set(x, y, 193);

    // 低温凝固：<1200° 变为固态钛
    const temp = world.getTemp(x, y);
    if (temp < 1200) {
      world.set(x, y, 192); // 钛
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居进行反应
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水蒸汽爆炸：水变蒸汽，周围产生火花和蒸汽
      if (nid === 2) {
        world.set(nx, ny, 8); // 水变蒸汽
        world.setTemp(nx, ny, 300);
        // 爆炸效果：周围空格产生火花/蒸汽
        const explDirs = DIRS8;
        for (const [ex, ey] of explDirs) {
          const ex2 = x + ex, ey2 = y + ey;
          if (!world.inBounds(ex2, ey2)) continue;
          if (world.isEmpty(ex2, ey2)) {
            world.set(ex2, ey2, Math.random() < 0.5 ? 8 : 28); // 蒸汽或火花
            world.setTemp(ex2, ey2, 400);
            world.markUpdated(ex2, ey2);
          } else if (world.get(ex2, ey2) === 2) {
            world.set(ex2, ey2, 8); // 附近的水也蒸发
            world.setTemp(ex2, ey2, 200);
            world.markUpdated(ex2, ey2);
          }
        }
        world.wakeArea(x, y);
        return;
      }

      // 点燃可燃物
      if ((nid === 4 || nid === 5 || nid === 13 || nid === 25 || nid === 46) && Math.random() < 0.2) {
        world.set(nx, ny, 6); // 着火
        world.markUpdated(nx, ny);
      }
    }

    // 极小概率自然冷却
    if (Math.random() < 0.0005) {
      world.set(x, y, 192); // 凝固为钛
      return;
    }

    if (y >= world.height - 1) return;

    // 缓慢下落（比熔岩更慢，非常粘稠）
    if (Math.random() < 0.5) {
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
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
    }

    // 缓慢水平流动
    if (Math.random() < 0.2) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const nx = x + dir;
      if (world.inBounds(nx, y) && world.isEmpty(nx, y)) {
        world.swap(x, y, nx, y);
        world.markUpdated(nx, y);
        return;
      }
    }

    // 密度置换：液态钛极重，沉入轻液体
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 6.0 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
    }
  },
};

registerMaterial(MoltenTitanium);
