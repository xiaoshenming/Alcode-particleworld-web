import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蚂蚁 —— 有简单 AI 的生物粒子
 * - 受重力影响，会在地面上左右行走
 * - 能挖掘沙子和泥土（吃掉脚下/前方的粉末）
 * - 遇到障碍会尝试攀爬
 * - 遇水/火/酸/熔岩会死亡
 * - 有限寿命，死后变成泥土
 */

/** 蚂蚁状态存储 */
interface AntState {
  dir: number;      // 移动方向 -1=左, 1=右
  life: number;     // 剩余寿命
  carrying: number; // 搬运的材质 ID（0=空手）
}

const antStates = new Map<string, AntState>();

/** 可挖掘的材质 */
const DIGGABLE = new Set([1, 15, 20, 21, 23]); // 沙子、雪、泥土、黏土、盐

/** 致命材质 */
const DEADLY = new Set([2, 6, 9, 11, 16, 18, 24]); // 水、火、酸液、熔岩、雷电、毒气、盐水

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function getState(x: number, y: number): AntState {
  let s = antStates.get(key(x, y));
  if (!s) {
    s = {
      dir: Math.random() < 0.5 ? -1 : 1,
      life: 500 + Math.floor(Math.random() * 500),
      carrying: 0,
    };
    antStates.set(key(x, y), s);
  }
  return s;
}

function moveState(ox: number, oy: number, nx: number, ny: number): void {
  const s = antStates.get(key(ox, oy));
  if (s) {
    antStates.delete(key(ox, oy));
    antStates.set(key(nx, ny), s);
  }
}

function removeState(x: number, y: number): void {
  antStates.delete(key(x, y));
}

/** 清空所有蚂蚁状态（世界重置时调用） */
export function clearAntStates(): void {
  antStates.clear();
}

export const Ant: MaterialDef = {
  id: 40,
  name: '蚂蚁',
  color() {
    // 深棕/黑色，微小变化
    const t = Math.random();
    const r = 40 + Math.floor(t * 20);
    const g = 20 + Math.floor(t * 15);
    const b = 10 + Math.floor(t * 10);
    return (0xFF << 24) | (b << 16) | (g << 8) | r;
  },
  density: 2.5,
  update(x: number, y: number, world: WorldAPI) {
    const state = getState(x, y);

    // 寿命递减
    state.life--;
    if (state.life <= 0) {
      world.set(x, y, 20); // 死后变泥土
      removeState(x, y);
      return;
    }

    // 检查是否接触致命材质
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = x + dx, ny = y + dy;
      if (world.inBounds(nx, ny) && DEADLY.has(world.get(nx, ny))) {
        world.set(x, y, 0); // 死亡消失
        removeState(x, y);
        return;
      }
    }

    // 重力：如果脚下是空气，下落
    if (y < world.height - 1 && world.isEmpty(x, y + 1)) {
      world.swap(x, y, x, y + 1);
      world.markUpdated(x, y + 1);
      moveState(x, y, x, y + 1);
      return;
    }

    // 斜下落
    if (y < world.height - 1) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (world.inBounds(x + dir, y + 1) && world.isEmpty(x + dir, y + 1)) {
        world.swap(x, y, x + dir, y + 1);
        world.markUpdated(x + dir, y + 1);
        moveState(x, y, x + dir, y + 1);
        return;
      }
    }

    // 在地面上行走（每帧 60% 概率行动，模拟缓慢移动）
    if (Math.random() > 0.6) return;

    const fx = x + state.dir; // 前方位置

    // 前方空位 → 直接走
    if (world.inBounds(fx, y) && world.isEmpty(fx, y)) {
      world.swap(x, y, fx, y);
      world.markUpdated(fx, y);
      moveState(x, y, fx, y);
      return;
    }

    // 前方是可挖掘材质 → 挖掘（搬运或消除）
    if (world.inBounds(fx, y) && DIGGABLE.has(world.get(fx, y))) {
      if (state.carrying === 0) {
        state.carrying = world.get(fx, y);
        world.set(fx, y, 0);
      } else {
        // 已经搬着东西 → 放下
        // 尝试在头顶放下
        if (y > 0 && world.isEmpty(x, y - 1)) {
          world.set(x, y - 1, state.carrying);
          state.carrying = 0;
        }
      }
      return;
    }

    // 前方有障碍 → 尝试攀爬（向上一格+前方一格）
    if (y > 0 && world.inBounds(fx, y - 1) && world.isEmpty(x, y - 1) && world.isEmpty(fx, y - 1)) {
      world.swap(x, y, fx, y - 1);
      world.markUpdated(fx, y - 1);
      moveState(x, y, fx, y - 1);
      return;
    }

    // 无法前进 → 转向
    state.dir = -state.dir;

    // 搬运中的蚂蚁偶尔放下材质
    if (state.carrying !== 0 && Math.random() < 0.05) {
      if (y > 0 && world.isEmpty(x, y - 1)) {
        world.set(x, y - 1, state.carrying);
        state.carrying = 0;
      }
    }
  },
};

registerMaterial(Ant);
