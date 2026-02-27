import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 液态钠 —— 熔融状态的金属钠
 * - 液体，密度 1.5
 * - 低温(<98°)凝固为固态钠(79)
 * - 遇水(2)剧烈爆炸：产生氢气(19)+火(6)+蒸汽(8)，比固态钠反应更猛烈
 * - 银色发光液体，带橙色光泽
 */

/** 凝固点 */
const FREEZING_POINT = 98;

/** 水系材质 */
const WATER_LIKE = new Set([2, 24, 45]); // 水、盐水、蜂蜜

export const MoltenSodium: MaterialDef = {
  id: 177,
  name: '液态钠',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 银色发光
      r = 210 + Math.floor(Math.random() * 25);
      g = 200 + Math.floor(Math.random() * 20);
      b = 190 + Math.floor(Math.random() * 15);
    } else if (phase < 0.7) {
      // 橙色光泽
      r = 230 + Math.floor(Math.random() * 20);
      g = 180 + Math.floor(Math.random() * 25);
      b = 120 + Math.floor(Math.random() * 20);
    } else {
      // 亮白高光（发光感）
      r = 240 + Math.floor(Math.random() * 15);
      g = 225 + Math.floor(Math.random() * 15);
      b = 200 + Math.floor(Math.random() * 20);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 1.5,
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 低温凝固为固态钠
    if (temp < FREEZING_POINT) {
      world.set(x, y, 79); // 钠
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇水剧烈爆炸（比固态钠更猛烈）
      if (WATER_LIKE.has(nid)) {
        explode(x, y, world);
        return;
      }

      // 遇酸液反应
      if (nid === 9 && Math.random() < 0.4) {
        world.set(x, y, 19); // 氢气
        world.set(nx, ny, 6); // 火
        world.setTemp(nx, ny, 200);
        world.wakeArea(x, y);
        world.wakeArea(nx, ny);
        return;
      }
    }

    // 自身持续散热（维持高温发光）
    world.addTemp(x, y, -0.5);

    // 液体流动逻辑
    if (y + 1 < world.height) {
      // 直接下落
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.markUpdated(x, y + 1);
        return;
      }

      // 密度置换
      const belowDensity = world.getDensity(x, y + 1);
      if (belowDensity > 0 && belowDensity < 1.5 && belowDensity < Infinity) {
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

      // 水平流动
      const dir2 = Math.random() < 0.5 ? -1 : 1;
      const spread = 2 + Math.floor(Math.random() * 2);
      for (let d = 1; d <= spread; d++) {
        const sx = x + dir2 * d;
        if (!world.inBounds(sx, y)) break;
        if (world.isEmpty(sx, y)) {
          world.swap(x, y, sx, y);
          world.markUpdated(sx, y);
          return;
        }
        if (!world.isEmpty(sx, y)) break;
      }
    }
  },
};

/** 液态钠遇水爆炸：比固态钠更猛烈，范围更大 */
function explode(cx: number, cy: number, world: WorldAPI): void {
  // 自身变为火
  world.set(cx, cy, 6);
  world.setTemp(cx, cy, 500);
  world.wakeArea(cx, cy);

  // 大范围爆炸（半径3）
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const nx = cx + dx, ny = cy + dy;
      if (!world.inBounds(nx, ny)) continue;
      const dist = dx * dx + dy * dy;
      if (dist > 9) continue; // 半径3

      const nid = world.get(nx, ny);

      // 中心区域（距离<=2）
      if (dist <= 4) {
        if (nid === 0) {
          // 空气变为火或氢气
          const roll = Math.random();
          if (roll < 0.4) {
            world.set(nx, ny, 6); // 火
            world.setTemp(nx, ny, 400);
          } else if (roll < 0.6) {
            world.set(nx, ny, 19); // 氢气
          } else if (roll < 0.8) {
            world.set(nx, ny, 8); // 蒸汽
          }
          world.markUpdated(nx, ny);
        } else if (nid === 2 || nid === 24 || nid === 45) {
          // 水系变为蒸汽或氢气
          world.set(nx, ny, Math.random() < 0.5 ? 8 : 19);
          world.markUpdated(nx, ny);
        } else if (nid === 177) {
          // 链式引爆其他液态钠
          world.set(nx, ny, 6);
          world.setTemp(nx, ny, 500);
          world.markUpdated(nx, ny);
        }
      }
      // 外圈
      else if (Math.random() < 0.4) {
        if (nid === 0) {
          world.set(nx, ny, Math.random() < 0.5 ? 28 : 8); // 火花或蒸汽
          world.markUpdated(nx, ny);
        } else if (nid === 2 || nid === 24) {
          world.set(nx, ny, 8); // 蒸汽
          world.markUpdated(nx, ny);
        }
      }

      world.addTemp(nx, ny, 150);
      world.wakeArea(nx, ny);
    }
  }
}

registerMaterial(MoltenSodium);
