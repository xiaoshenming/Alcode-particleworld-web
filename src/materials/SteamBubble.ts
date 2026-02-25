import type { MaterialDef, WorldAPI } from './types';
import { registerMaterial } from './registry';

/**
 * 蒸汽泡 —— 短寿命的上升气泡
 * - 气体，密度 0.1（极轻，快速上升）
 * - 短寿命：几帧后破裂变为蒸汽(8)
 * - 上升过程中左右摇摆
 * - 遇固体障碍物立即破裂
 * - 半透明白色
 */

/** 蒸汽泡寿命追踪 */
const bubbleLife = new Map<number, number>();

function lifeKey(x: number, y: number): number {
  return y * 10000 + x;
}

/** 固体材质（碰到就破裂） */
const SOLID = new Set([3, 4, 10, 17, 32, 33, 34, 36, 53, 60, 174]); // 石头、木头、金属、玻璃、钻石、橡胶、水泥、混凝土、水晶、黑曜石、锆石

export const SteamBubble: MaterialDef = {
  id: 175,
  name: '蒸汽泡',
  color() {
    // 半透明白色，带微蓝
    const base = 230 + Math.floor(Math.random() * 20);
    const r = base - Math.floor(Math.random() * 10);
    const g = base;
    const b = base + Math.floor(Math.random() * 10);
    // 半透明 alpha
    return (0xB0 << 24) | (b << 16) | (g << 8) | r;
  },
  density: 0.1, // 极轻
  update(x: number, y: number, world: WorldAPI) {
    const k = lifeKey(x, y);

    // 初始化寿命（短寿命：15~40帧）
    let life = bubbleLife.get(k) ?? 0;
    if (life === 0) {
      life = 15 + Math.floor(Math.random() * 26);
      bubbleLife.set(k, life);
    }

    // 寿命递减
    life--;
    if (life <= 0) {
      // 破裂变为蒸汽
      world.set(x, y, 8);
      bubbleLife.delete(k);
      world.wakeArea(x, y);
      return;
    }
    bubbleLife.set(k, life);

    // 到达顶部边界破裂
    if (y <= 0) {
      world.set(x, y, 8);
      bubbleLife.delete(k);
      world.wakeArea(x, y);
      return;
    }

    // 检查邻居：碰到固体立即破裂
    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!world.inBounds(nx, ny)) continue;
      const nid = world.get(nx, ny);

      if (SOLID.has(nid)) {
        world.set(x, y, 8); // 破裂为蒸汽
        bubbleLife.delete(k);
        world.wakeArea(x, y);
        return;
      }
    }

    // 快速上升
    if (world.isEmpty(x, y - 1)) {
      bubbleLife.delete(k);
      world.swap(x, y, x, y - 1);
      bubbleLife.set(lifeKey(x, y - 1), life);
      world.markUpdated(x, y - 1);
      world.wakeArea(x, y);

      // 左右摇摆（上升同时随机偏移）
      if (Math.random() < 0.4) {
        const drift = Math.random() < 0.5 ? -1 : 1;
        const nx = x + drift;
        if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
          const curLife = bubbleLife.get(lifeKey(x, y - 1)) ?? life;
          bubbleLife.delete(lifeKey(x, y - 1));
          world.swap(x, y - 1, nx, y - 1);
          bubbleLife.set(lifeKey(nx, y - 1), curLife);
          world.markUpdated(nx, y - 1);
        }
      }
      return;
    }

    // 上方被占据时尝试斜上浮
    const d = Math.random() < 0.5 ? -1 : 1;
    for (const sd of [d, -d]) {
      const nx = x + sd;
      if (world.inBounds(nx, y - 1) && world.isEmpty(nx, y - 1)) {
        bubbleLife.delete(k);
        world.swap(x, y, nx, y - 1);
        bubbleLife.set(lifeKey(nx, y - 1), life);
        world.markUpdated(nx, y - 1);
        world.wakeArea(x, y);
        return;
      }
    }

    // 无法上升时也保持活跃（等待破裂）
    world.wakeArea(x, y);
  },
};

registerMaterial(SteamBubble);
