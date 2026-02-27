import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 沥青湖 —— 天然沥青湖泊中的超粘稠液体
 * - 液体，密度 2.8，极粘稠（流动极慢）
 * - 可燃：遇火(6)/熔岩(11)点燃，燃烧产生大量浓烟(7)
 * - 高温(>300°)变得更流动
 * - 深黑色带棕色光泽
 */

/** 可点燃沥青湖的材质 */
const IGNITER = new Set([6, 11, 55, 28]); // 火、熔岩、等离子体、火花

export const AsphaltLake: MaterialDef = {
  id: 179,
  name: '沥青湖',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.5) {
      // 深黑色
      r = 15 + Math.floor(Math.random() * 12);
      g = 12 + Math.floor(Math.random() * 10);
      b = 8 + Math.floor(Math.random() * 8);
    } else if (phase < 0.8) {
      // 深棕黑色光泽
      r = 40 + Math.floor(Math.random() * 15);
      g = 25 + Math.floor(Math.random() * 10);
      b = 10 + Math.floor(Math.random() * 8);
    } else {
      // 棕色油光反射
      r = 55 + Math.floor(Math.random() * 20);
      g = 35 + Math.floor(Math.random() * 12);
      b = 15 + Math.floor(Math.random() * 10);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.8,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 极高温自燃
    if (temp > 300 && Math.random() < 0.1) {
      ignite(x, y, world);
      return;
    }

    // 检查邻居
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火源燃烧
      if (IGNITER.has(nid) && Math.random() < 0.12) {
        ignite(x, y, world);
        return;
      }

      // 酸液缓慢溶解
      if (nid === 9 && Math.random() < 0.03) {
        world.set(x, y, 0);
        world.set(nx, ny, 0);
        world.wakeArea(x, y);
        return;
      }
    }

    // 粘度计算：温度越高越流动
    let moveChance: number;
    if (temp < 20) {
      moveChance = 0.01; // 常温几乎凝固
    } else if (temp < 100) {
      moveChance = 0.02 + (temp - 20) * 0.002;
    } else if (temp < 300) {
      moveChance = 0.18 + (temp - 100) * 0.002;
    } else {
      moveChance = 0.6 + (temp - 300) * 0.003; // 高温软化
    }
    moveChance = Math.min(moveChance, 0.85);

    if (Math.random() > moveChance) {
      world.wakeArea(x, y); // 保持活跃以检测邻居
      return;
    }

    if (y >= world.height - 1) return;

    // 直接下落
    if (world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      return;
    }

    // 密度置换
    const belowDensity = world.getDensity(x, y + 1);
    if (belowDensity > 0 && belowDensity < 2.8 && belowDensity < Infinity) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y);
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

    // 水平流动（极缓慢，概率很低）
    if (Math.random() < 0.05) {
            {
        const d = dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
      }
      {
        const d = -dir;
        const sx = x + d;
        if (world.inBounds(sx, y) && world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
      }
    }
  },
};

/** 沥青湖燃烧：产生大量浓烟 */
function ignite(x: number, y: number, world: WorldAPI): void {
  world.set(x, y, 6); // 火
  world.setTemp(x, y, 250);
  world.wakeArea(x, y);

  // 产生大量浓烟（上方和斜上方）
  for (let dx = -1; dx <= 1; dx++) {
    const ny = y - 1;
    const nx = x + dx;
    if (world.inBounds(nx, ny) && world.isEmpty(nx, ny)) {
      world.set(nx, ny, 7); // 烟
      world.markUpdated(nx, ny);
      world.wakeArea(nx, ny);
    }
  }
  // 额外一层烟
  if (world.inBounds(x, y - 2) && world.isEmpty(x, y - 2)) {
    world.set(x, y - 2, 7);
    world.markUpdated(x, y - 2);
    world.wakeArea(x, y - 2);
  }
}

registerMaterial(AsphaltLake);
