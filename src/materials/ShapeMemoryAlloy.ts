import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 形状记忆合金 —— 温度响应智能材料
 * - 固体，密度 Infinity（不可移动）
 * - 低温(<0°)时变为"收缩态"：颜色变暗，密度变为粉末可下落
 * - 常温(20°~100°)时为固态不动
 * - 高温(>100°)时"膨胀"：向上推动上方粒子
 * - 极高温(>1400°)熔化为熔岩
 * - 银色带金色调
 */

export const ShapeMemoryAlloy: MaterialDef = {
  id: 260,
  name: '记忆合金',
  category: '特殊',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 银色
      const base = 180 + Math.floor(Math.random() * 25);
      r = base;
      g = base + 3;
      b = base + 5;
    } else if (phase < 0.8) {
      // 金色调
      r = 200 + Math.floor(Math.random() * 20);
      g = 185 + Math.floor(Math.random() * 15);
      b = 140 + Math.floor(Math.random() * 20);
    } else {
      // 高光
      const base = 210 + Math.floor(Math.random() * 30);
      r = base;
      g = base - 5;
      b = base - 15;
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: Infinity,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温熔化
    if (temp > 1400) {
      world.set(x, y, 11); // 熔岩
      world.setTemp(x, y, temp);
      world.wakeArea(x, y);
      return;
    }

    // 低温收缩态：变为可下落的粉末行为
    if (temp < 0) {
      if (y < world.height - 1 && world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }
      // 斜向下落
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (y < world.height - 1 && world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        return;
      }
    }

    // 高温膨胀：向上推动粒子
    if (temp > 100) {
      if (y > 0 && !world.isEmpty(x, y - 1) && world.get(x, y - 1) !== 260) {
        // 尝试把上方粒子再往上推
        if (y > 1 && world.isEmpty(x, y - 2) && Math.random() < 0.15) {
          world.swap(x, y - 1, x, y - 2);
          world.markUpdated(x, y - 2);
          world.wakeArea(x, y - 1);
        }
      }
    }

    // 检查四邻：导热
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (nid !== 0 && Math.random() < 0.12) {
        const nt = world.getTemp(nx, ny);
        if (Math.abs(temp - nt) > 5) {
          const avg = (temp + nt) / 2;
          world.setTemp(x, y, avg);
          world.setTemp(nx, ny, avg);
        }
      }
    }
  },
};

registerMaterial(ShapeMemoryAlloy);
