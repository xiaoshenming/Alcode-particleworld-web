import { DIRS4 } from './types';
import type { MaterialDef, WorldAPI } from './types';;
import { registerMaterial } from './registry';

/**
 * 纤维 —— 轻质有机固体
 * - 固体，受重力影响（像沙子一样堆积）
 * - 密度低，会浮在水面上
 * - 极易燃烧，遇火迅速蔓延
 * - 遇水变湿后不易燃（湿纤维）
 * - 酸液溶解
 * - 可被蚂蚁/白蚁搬运（吃掉）
 * - 视觉上呈米黄色丝状
 */

/** 湿润状态追踪：用概率模拟 */
const WET_CHANCE = 0.4; // 接触水后有概率变湿（不燃）

export const Fiber: MaterialDef = {
  id: 91,
  name: '纤维',
  color() {
    const phase = Math.random();
    let r: number, g: number, b: number;
    if (phase < 0.4) {
      // 米黄色
      r = 210 + Math.floor(Math.random() * 25);
      g = 190 + Math.floor(Math.random() * 20);
      b = 140 + Math.floor(Math.random() * 20);
    } else if (phase < 0.7) {
      // 浅棕色
      r = 195 + Math.floor(Math.random() * 20);
      g = 170 + Math.floor(Math.random() * 15);
      b = 120 + Math.floor(Math.random() * 15);
    } else {
      // 亮白丝光
      r = 230 + Math.floor(Math.random() * 20);
      g = 220 + Math.floor(Math.random() * 15);
      b = 180 + Math.floor(Math.random() * 15);
    }
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.8, // 比水轻，会浮起来
  update(x: number, y: number, world: WorldAPI) {
    const temp = world.getTemp(x, y);

    // 高温自燃
    if (temp > 100 && Math.random() < 0.1) {
      world.set(x, y, 6); // 火
      world.setTemp(x, y, 120);
      world.wakeArea(x, y);
      return;
    }

    // 邻居交互
    const dirs = DIRS4;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      // 遇火极易燃烧
      if (nid === 6 && Math.random() < 0.25) {
        world.set(x, y, 6); // 着火
        world.setTemp(x, y, 130);
        world.wakeArea(x, y);
        return;
      }

      // 遇熔岩燃烧
      if (nid === 11 && Math.random() < 0.3) {
        world.set(x, y, 6);
        world.setTemp(x, y, 150);
        world.wakeArea(x, y);
        return;
      }

      // 遇水：有概率变为湿纤维（用木头代替，不易燃）
      if (nid === 2 && Math.random() < WET_CHANCE * 0.02) {
        world.set(x, y, 4); // 变为木头（湿纤维近似）
        world.wakeArea(x, y);
        return;
      }

      // 酸液溶解
      if (nid === 9 && Math.random() < 0.08) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 蚂蚁/白蚁吃掉
      if ((nid === 40 || nid === 81) && Math.random() < 0.06) {
        world.set(x, y, 0);
        world.wakeArea(x, y);
        return;
      }

      // 等离子体烧毁
      if (nid === 55 && Math.random() < 0.4) {
        world.set(x, y, 7); // 烟
        world.wakeArea(x, y);
        return;
      }
    }

    // 重力下落（粉末状堆积）
    if (y + 1 < world.height) {
      const belowId = world.get(x, y + 1);
      if (world.isEmpty(x, y + 1)) {
        world.swap(x, y, x, y + 1);
        world.wakeArea(x, y);
        return;
      }

      // 浮在水/液体上（密度置换）
      if (belowId !== 0 && world.getDensity(x, y + 1) > 0.8 && world.getDensity(x, y + 1) < 0.8) {
        // 不会沉入比自己重的液体 — 实际上密度比水轻所以浮起
      }

      // 斜下滑落
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

    // 被液体浮起（密度低于水）
    if (y > 0) {
      const aboveId = world.get(x, y - 1);
      if (aboveId === 0) {
        // 检查下方是否有液体
        if (y + 1 < world.height) {
          const belowDensity = world.getDensity(x, y + 1);
          const belowId = world.get(x, y + 1);
          if (belowId !== 0 && belowDensity > 0.8 && belowDensity !== Infinity && Math.random() < 0.15) {
            world.swap(x, y, x, y - 1);
            world.wakeArea(x, y);
            world.wakeArea(x, y - 1);
            return;
          }
        }
      }
    }
  },
};

registerMaterial(Fiber);
